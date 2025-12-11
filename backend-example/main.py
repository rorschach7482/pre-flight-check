"""
RAG Chatbot API - Example FastAPI Backend

Multi-model RAG chatbot powered by Haystack (example implementation).
This is a complete example showing the API structure matching the OpenAPI spec.

To run this example:
1. Install dependencies: pip install -r requirements.txt
2. Run: uvicorn main:app --reload
3. API docs: http://localhost:8000/docs

Note: This is a mock implementation. In production, you would integrate with:
- Haystack for RAG functionality
- Qdrant for vector storage
- Redis for caching
- Supabase for database
- OpenAI/Anthropic for LLM
- Perplexity for web context
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime
import asyncio
import uuid

app = FastAPI(
    title="RAG Chatbot API",
    description="Multi-model RAG chatbot powered by Haystack",
    version="1.0.0",
    servers=[{"url": "/api/v1", "description": "API v1 endpoint"}]
)

# CORS Configuration - Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative port
        "http://localhost:8000",  # Backend docs
        # Add your production domain here
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Data Models (matching OpenAPI spec)
# ============================================================================

# Chat Models
class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000, description="User query")
    doc_id: Optional[str] = Field(None, description="Document ID to query (optional)")
    framework: Literal["haystack"] = Field("haystack", description="RAG framework")
    stream: bool = Field(False, description="Enable streaming response")
    temperature: float = Field(0.7, ge=0.0, le=2.0, description="LLM temperature")
    max_tokens: int = Field(1000, ge=1, le=4000, description="Maximum tokens in response")
    use_perplexity: bool = Field(False, description="Enhance answer with web context")

class Source(BaseModel):
    content: str = Field(..., description="Chunk content")
    score: float = Field(..., description="Relevance score")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Chunk metadata")

class ChatResponse(BaseModel):
    answer: str
    sources: Optional[List[Source]] = None
    framework: str
    tokens_used: int
    latency_ms: float
    cached: bool = False
    web_context: Optional[str] = None
    prompt_metadata: Optional[Dict[str, Any]] = None

# Document Models
class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    status: str
    uploaded_at: str
    framework: str

class DocumentListItem(BaseModel):
    document_id: str
    filename: str
    uploaded_at: str
    status: str
    framework: str
    size: Optional[int] = None

class DocumentListResponse(BaseModel):
    documents: List[DocumentListItem]
    total: int
    limit: int
    offset: int

class DocumentDetailResponse(BaseModel):
    document_id: str
    filename: str
    uploaded_at: str
    indexed_at: Optional[str] = None
    status: str
    framework: str
    size: Optional[int] = None
    chunks: Optional[int] = None
    metadata: Dict[str, Any] = {}

class DocumentDeleteResponse(BaseModel):
    status: str
    message: str
    document_id: str
    filename: str

# RAG Framework Models
class FrameworkStatusResponse(BaseModel):
    framework: str
    available_frameworks: List[str]

class HaystackStats(BaseModel):
    total_queries: int
    avg_latency_ms: float
    p95_latency_ms: float
    p99_latency_ms: float
    cache_hit_rate: float
    error_rate: float

class RAGStatsResponse(BaseModel):
    current_framework: str
    haystack: HaystackStats

# Queue Models
class QueueStatusResponse(BaseModel):
    success: bool
    queue: Dict[str, Any]
    timestamp: str

class QueueHealthResponse(BaseModel):
    healthy: bool
    queue_depth: int
    processing: int
    retry: int
    dead_letter: int
    timestamp: str


# ============================================================================
# In-Memory Storage (Replace with Supabase/Database + Redis + Qdrant)
# ============================================================================

# Mock storage - replace with actual services in production
documents_db: Dict[str, DocumentDetailResponse] = {}
queue_db: Dict[str, Dict[str, Any]] = {
    "main": [],
    "retry": [],
    "dead_letter": [],
    "processing": []
}
stats_db = {
    "total_queries": 0,
    "total_latency_ms": 0,
    "latencies": [],
    "cache_hits": 0,
    "errors": 0
}


# ============================================================================
# Health API
# ============================================================================

@app.get("/api/v1/", tags=["Health"])
async def root():
    """Root health check endpoint"""
    return {
        "status": "healthy",
        "message": "RAG Chatbot API is running",
        "rag_framework": "haystack",
        "version": "1.0.0"
    }


@app.get("/api/v1/status", tags=["Health"])
async def get_status():
    """Get detailed system status including service connections"""
    return {
        "status": "healthy",
        "rag_framework": "haystack",
        "version": "1.0.0",
        "services": {
            "qdrant": "connected",
            "redis": "connected",
            "supabase": "connected",
            "openai": "connected"
        }
    }


@app.get("/api/v1/cache", tags=["Health"])
async def get_cache_status():
    """Get Redis cache status and statistics"""
    return {
        "status": "connected",
        "total_keys": len(documents_db),
        "memory_usage": "1.2 MB",
        "error": None
    }


# ============================================================================
# Documents API
# ============================================================================

@app.post("/api/v1/documents/upload", response_model=DocumentUploadResponse, tags=["Documents"])
async def upload_document(file: UploadFile = File(...)):
    """Upload a PDF document for indexing"""
    # Validate PDF
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only PDF files are supported."
        )
    
    # Read file content
    contents = await file.read()
    
    # Create document record
    document_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    document = DocumentDetailResponse(
        document_id=document_id,
        filename=file.filename or "unknown.pdf",
        uploaded_at=now,
        status="processing",
        framework="haystack",
        size=len(contents),
        chunks=None,
        metadata={}
    )
    
    documents_db[document_id] = document
    
    # Add to processing queue
    queue_db["main"].append({
        "document_id": document_id,
        "filename": file.filename,
        "added_at": now
    })
    
    # Simulate async processing
    asyncio.create_task(process_document(document_id))
    
    return DocumentUploadResponse(
        document_id=document_id,
        filename=file.filename or "unknown.pdf",
        status="processing",
        uploaded_at=now,
        framework="haystack"
    )


async def process_document(document_id: str):
    """Simulate document processing (PDF parsing, chunking, embedding)"""
    await asyncio.sleep(3)  # Simulate processing time
    
    if document_id in documents_db:
        # Update document status
        documents_db[document_id].status = "ready"
        documents_db[document_id].indexed_at = datetime.now().isoformat()
        documents_db[document_id].chunks = 42  # Mock chunk count
        
        # Remove from processing queue
        queue_db["main"] = [
            item for item in queue_db["main"]
            if item.get("document_id") != document_id
        ]


@app.get("/api/v1/documents", response_model=DocumentListResponse, tags=["Documents"])
async def list_documents(limit: int = 50, offset: int = 0):
    """List all uploaded documents"""
    all_docs = list(documents_db.values())
    total = len(all_docs)
    
    # Paginate
    paginated_docs = all_docs[offset:offset + limit]
    
    return DocumentListResponse(
        documents=[
            DocumentListItem(
                document_id=doc.document_id,
                filename=doc.filename,
                uploaded_at=doc.uploaded_at,
                status=doc.status,
                framework=doc.framework,
                size=doc.size
            )
            for doc in paginated_docs
        ],
        total=total,
        limit=limit,
        offset=offset
    )


@app.get("/api/v1/documents/{doc_id}", response_model=DocumentDetailResponse, tags=["Documents"])
async def get_document(doc_id: str):
    """Get document details by ID"""
    if doc_id not in documents_db:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return documents_db[doc_id]


@app.delete("/api/v1/documents/{doc_id}", response_model=DocumentDeleteResponse, tags=["Documents"])
async def delete_document(doc_id: str):
    """Delete a document by ID. Removes from database, vector store, and cache."""
    if doc_id not in documents_db:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc = documents_db[doc_id]
    filename = doc.filename
    
    # Remove from storage
    del documents_db[doc_id]
    
    # Remove from all queues
    for queue_name in queue_db:
        queue_db[queue_name] = [
            item for item in queue_db[queue_name]
            if item.get("document_id") != doc_id
        ]
    
    return DocumentDeleteResponse(
        status="success",
        message=f"Document '{filename}' deleted successfully",
        document_id=doc_id,
        filename=filename
    )


# ============================================================================
# Chat API
# ============================================================================

@app.post("/api/v1/chat", tags=["Chat"])
async def chat(request: ChatRequest):
    """Query documents using RAG with streaming by default (SSE)"""
    import time
    start_time = time.time()
    
    async def generate():
        # Mock streaming response
        mock_answer = (
            f"Based on your query '{request.query}', "
            f"here's what I found in the documents. "
            f"This is a mock streaming response. "
            f"In production, this would use Haystack to retrieve relevant chunks "
            f"and stream tokens from the LLM."
        )
        
        for word in mock_answer.split():
            yield f"data: {word} \n\n"
            await asyncio.sleep(0.05)
        
        yield "data: [DONE]\n\n"
    
    # Update stats
    stats_db["total_queries"] += 1
    
    return StreamingResponse(generate(), media_type="text/event-stream")


@app.post("/api/v1/chat/complete", response_model=ChatResponse, tags=["Chat"])
async def chat_complete(request: ChatRequest):
    """Non-streaming chat endpoint for complete responses"""
    import time
    start_time = time.time()
    
    # Simulate RAG retrieval
    await asyncio.sleep(0.5)
    
    # Mock response
    mock_answer = (
        f"Based on your query '{request.query}', "
        f"here's what I found in the documents. "
        f"This is a complete response. "
        f"In production, this would use Haystack to retrieve relevant chunks "
        f"and generate a response from the LLM."
    )
    
    # Calculate latency
    latency_ms = (time.time() - start_time) * 1000
    
    # Update stats
    stats_db["total_queries"] += 1
    stats_db["total_latency_ms"] += latency_ms
    stats_db["latencies"].append(latency_ms)
    
    response = ChatResponse(
        answer=mock_answer,
        sources=[
            Source(
                content="This is a relevant excerpt from the document...",
                score=0.95,
                metadata={"document_id": "mock-doc-123", "chunk_id": 5}
            ),
            Source(
                content="Another relevant section of text...",
                score=0.87,
                metadata={"document_id": "mock-doc-456", "chunk_id": 12}
            )
        ],
        framework="haystack",
        tokens_used=len(mock_answer.split()) * 2,  # Rough estimate
        latency_ms=latency_ms,
        cached=False,
        web_context=None if not request.use_perplexity else "Mock web context from Perplexity",
        prompt_metadata={"version": "1.0", "source": "default"}
    )
    
    return response


# ============================================================================
# RAG Framework API
# ============================================================================

@app.get("/api/v1/rag/framework", response_model=FrameworkStatusResponse, tags=["RAG"])
async def get_framework():
    """Get the current active framework"""
    return FrameworkStatusResponse(
        framework="haystack",
        available_frameworks=["haystack"]
    )


@app.get("/api/v1/rag/stats", response_model=RAGStatsResponse, tags=["RAG"])
async def get_stats():
    """Get performance statistics for Haystack framework"""
    total_queries = stats_db["total_queries"]
    latencies = stats_db["latencies"]
    
    # Calculate statistics
    avg_latency = (
        stats_db["total_latency_ms"] / total_queries
        if total_queries > 0 else 0
    )
    
    # Calculate percentiles
    sorted_latencies = sorted(latencies) if latencies else [0]
    p95_index = int(len(sorted_latencies) * 0.95)
    p99_index = int(len(sorted_latencies) * 0.99)
    p95_latency = sorted_latencies[p95_index] if sorted_latencies else 0
    p99_latency = sorted_latencies[p99_index] if sorted_latencies else 0
    
    cache_hit_rate = (
        stats_db["cache_hits"] / total_queries
        if total_queries > 0 else 0
    )
    error_rate = (
        stats_db["errors"] / total_queries
        if total_queries > 0 else 0
    )
    
    return RAGStatsResponse(
        current_framework="haystack",
        haystack=HaystackStats(
            total_queries=total_queries,
            avg_latency_ms=round(avg_latency, 2),
            p95_latency_ms=round(p95_latency, 2),
            p99_latency_ms=round(p99_latency, 2),
            cache_hit_rate=round(cache_hit_rate, 3),
            error_rate=round(error_rate, 3)
        )
    )


# ============================================================================
# Queue API
# ============================================================================

@app.get("/api/v1/queue/status", tags=["Queue"])
async def get_queue_status():
    """Get current queue status and metrics"""
    return QueueStatusResponse(
        success=True,
        queue={
            "main": len(queue_db["main"]),
            "retry": len(queue_db["retry"]),
            "dead_letter": len(queue_db["dead_letter"]),
            "processing": len(queue_db["processing"])
        },
        timestamp=datetime.now().isoformat()
    )


@app.get("/api/v1/queue/health", response_model=QueueHealthResponse, tags=["Queue"])
async def queue_health_check():
    """Health check endpoint for queue system"""
    return QueueHealthResponse(
        healthy=True,
        queue_depth=len(queue_db["main"]),
        processing=len(queue_db["processing"]),
        retry=len(queue_db["retry"]),
        dead_letter=len(queue_db["dead_letter"]),
        timestamp=datetime.now().isoformat()
    )


@app.post("/api/v1/queue/retry/{document_id}", tags=["Queue"])
async def retry_document(document_id: str):
    """Manually retry a specific document from dead-letter queue"""
    # Find document in dead-letter queue
    found = False
    for item in queue_db["dead_letter"]:
        if item.get("document_id") == document_id:
            # Move to retry queue
            queue_db["retry"].append(item)
            queue_db["dead_letter"].remove(item)
            found = True
            break
    
    if not found:
        raise HTTPException(
            status_code=404,
            detail="Document not found in dead-letter queue"
        )
    
    return {
        "success": True,
        "message": f"Document {document_id} moved to retry queue",
        "document_id": document_id
    }


@app.get("/api/v1/queue/dead-letter", tags=["Queue"])
async def list_dead_letter_queue(
    limit: int = 100,
    offset: int = 0
):
    """List documents in dead-letter queue"""
    items = queue_db["dead_letter"]
    total = len(items)
    paginated = items[offset:offset + limit]
    
    return {
        "success": True,
        "count": total,
        "limit": limit,
        "offset": offset,
        "items": paginated
    }


@app.post("/api/v1/queue/dead-letter/reprocess-all", tags=["Queue"])
async def reprocess_all_dlq():
    """Reprocess all items in dead-letter queue"""
    total_items = len(queue_db["dead_letter"])
    
    # Move all items to retry queue
    queue_db["retry"].extend(queue_db["dead_letter"])
    reprocessed_count = len(queue_db["dead_letter"])
    queue_db["dead_letter"] = []
    
    return {
        "success": True,
        "message": f"Reprocessing {reprocessed_count} items",
        "reprocessed_count": reprocessed_count,
        "total_dlq_items": total_items
    }


@app.delete("/api/v1/queue/purge", tags=["Queue"])
async def purge_all_queues():
    """Clear all queues (admin operation)"""
    purged = {
        "main": len(queue_db["main"]),
        "retry": len(queue_db["retry"]),
        "dead_letter": len(queue_db["dead_letter"]),
        "processing": len(queue_db["processing"])
    }
    
    # Clear all queues
    queue_db["main"] = []
    queue_db["retry"] = []
    queue_db["dead_letter"] = []
    queue_db["processing"] = []
    
    return {
        "success": True,
        "message": "All queues purged successfully",
        "purged": purged
    }


@app.get("/api/v1/queue/document/{document_id}/status", tags=["Queue"])
async def get_document_processing_status(document_id: str):
    """Get processing status of a specific document"""
    # Check in all queues
    for queue_name, items in queue_db.items():
        for item in items:
            if item.get("document_id") == document_id:
                return {
                    "success": True,
                    "status": queue_name,
                    "details": item
                }
    
    # Check if document exists and is completed
    if document_id in documents_db:
        return {
            "success": True,
            "status": "completed",
            "details": {"document_id": document_id}
        }
    
    return {
        "success": False,
        "status": "not_found",
        "details": None
    }


@app.post("/api/v1/queue/process-retry-queue", tags=["Queue"])
async def process_retry_queue():
    """Manually trigger processing of retry queue"""
    moved_count = len(queue_db["retry"])
    
    # Move items from retry to main queue
    queue_db["main"].extend(queue_db["retry"])
    queue_db["retry"] = []
    
    return {
        "success": True,
        "message": f"Moved {moved_count} items to main queue",
        "moved_count": moved_count
    }


# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting RAG Chatbot API...")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔄 Alternative docs: http://localhost:8000/redoc")
    uvicorn.run(app, host="0.0.0.0", port=8000)
