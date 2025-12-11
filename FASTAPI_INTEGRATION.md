# FastAPI Backend Integration Guide

This guide explains how to connect your React frontend to the RAG Chatbot API FastAPI backend.

## Overview

This application is a **React + TypeScript** frontend built with:
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TanStack Query (React Query)** - Server state management
- **Tailwind CSS + shadcn/ui** - Styling

The frontend now includes a complete API service layer that matches the **RAG Chatbot API OpenAPI specification v1.0.0**, providing type-safe access to all backend endpoints.

## Architecture

### Current Structure

```
src/
├── hooks/               # Custom React hooks with mock data
│   ├── useProjects.ts   # Project management (in-memory)
│   ├── useChat.ts       # Chat functionality (mock responses)
│   └── usePromptLibrary.ts  # Prompt templates (in-memory)
├── services/            # API integration layer (NEW)
│   └── api.ts          # FastAPI client & endpoints
├── types/              # TypeScript type definitions
│   └── index.ts        # Project, Document, ChatMessage, Prompt types
└── contexts/
    └── AppContext.tsx  # Global state provider
```

## Quick Start

### Step 1: Configure Environment

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your FastAPI backend URL:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   VITE_API_TIMEOUT=30000
   ```

### Step 2: Start the Example Backend

The repository includes a complete RAG Chatbot API example implementation:

```bash
cd backend-example
pip install -r requirements.txt
uvicorn main:app --reload
```

Then access:
- API: http://localhost:8000/api/v1
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

### Step 3: Start the Frontend

```bash
npm install
npm run dev
```

## RAG Chatbot API Service Layer

### API Client Features

The `api.ts` file provides a complete implementation of the RAG Chatbot API OpenAPI specification v1.0.0:

- **APIClient class** - Generic HTTP client with methods:
  - `get<T>()` - GET requests with query params
  - `post<T>()` - POST requests with JSON body
  - `put<T>()` - PUT requests
  - `patch<T>()` - PATCH requests
  - `delete<T>()` - DELETE requests
  - `uploadFile<T>()` - File uploads with FormData
  - `stream()` - Server-Sent Events (SSE) for streaming

- **Error handling** - Custom APIError class with status codes
- **Timeout support** - Configurable request timeouts (default 30s)
- **Type safety** - Full TypeScript types matching OpenAPI spec
- **Pre-configured endpoints** - Ready-to-use API methods

### Available API Endpoints

The service layer includes complete implementations for:

#### Health API
```typescript
healthAPI.root()                    // GET / - Root health check
healthAPI.getStatus()               // GET /status - System status
healthAPI.getCacheStatus()          // GET /cache - Redis cache status
```

#### Documents API
```typescript
documentsAPI.upload(file)           // POST /documents/upload - Upload PDF
documentsAPI.list({ limit, offset }) // GET /documents - List documents
documentsAPI.get(docId)             // GET /documents/{doc_id} - Get details
documentsAPI.delete(docId)          // DELETE /documents/{doc_id} - Delete
```

#### Chat API
```typescript
chatAPI.chat(request)               // POST /chat - Streaming chat (SSE)
chatAPI.chatComplete(request)       // POST /chat/complete - Complete response
```

#### RAG Framework API
```typescript
ragAPI.getFramework()               // GET /rag/framework - Current framework
ragAPI.getStats()                   // GET /rag/stats - Performance stats
```

#### Queue API
```typescript
queueAPI.getStatus()                // GET /queue/status - Queue metrics
queueAPI.healthCheck()              // GET /queue/health - Health check
queueAPI.retryDocument(docId)       // POST /queue/retry/{document_id}
queueAPI.listDeadLetter({ limit, offset }) // GET /queue/dead-letter
queueAPI.reprocessAllDLQ()          // POST /queue/dead-letter/reprocess-all
queueAPI.purgeAllQueues()           // DELETE /queue/purge
queueAPI.getDocumentStatus(docId)   // GET /queue/document/{document_id}/status
queueAPI.processRetryQueue()        // POST /queue/process-retry-queue
```

#### Legacy API (backward compatibility)
```typescript
// Project-based endpoints (original Pre-Flight Check API)
projectsAPI.list()
legacyDocumentsAPI.upload(projectId, file)
legacyChatAPI.sendMessage(projectId, message)
promptsAPI.list()
```

## RAG Chatbot API OpenAPI Specification

The backend implements the complete RAG Chatbot API v1.0.0 specification. See the example backend in `backend-example/` for a full implementation.

### Key Request/Response Models

#### Chat Models

```python
class ChatRequest(BaseModel):
    query: str  # 1-1000 characters
    doc_id: Optional[str] = None  # Optional document filter
    framework: Literal["haystack"] = "haystack"
    stream: bool = False
    temperature: float = 0.7  # 0.0-2.0
    max_tokens: int = 1000  # 1-4000
    use_perplexity: bool = False  # Web context enhancement

class ChatResponse(BaseModel):
    answer: str
    sources: Optional[List[Source]] = None
    framework: str
    tokens_used: int
    latency_ms: float
    cached: bool = False
    web_context: Optional[str] = None
    prompt_metadata: Optional[Dict[str, Any]] = None

class Source(BaseModel):
    content: str  # Chunk content
    score: float  # Relevance score
    metadata: Optional[Dict[str, Any]] = None
```

#### Document Models

```python
class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    status: str  # "processing", "ready", "error"
    uploaded_at: str  # ISO 8601 datetime
    framework: str  # "haystack"

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
```

#### RAG Framework Models

```python
class FrameworkStatusResponse(BaseModel):
    framework: str
    available_frameworks: List[str]

class RAGStatsResponse(BaseModel):
    current_framework: str
    haystack: HaystackStats

class HaystackStats(BaseModel):
    total_queries: int
    avg_latency_ms: float
    p95_latency_ms: float
    p99_latency_ms: float
    cache_hit_rate: float
    error_rate: float
```

#### Queue Models

```python
class QueueHealthResponse(BaseModel):
    healthy: bool
    queue_depth: int
    processing: int
    retry: int
    dead_letter: int
    timestamp: str
```

## Example Usage

### TypeScript/React Usage

```typescript
import { documentsAPI, chatAPI, ragAPI, queueAPI } from '@/services/api';

// Upload a PDF document
const uploadDocument = async (file: File) => {
  const response = await documentsAPI.upload(file);
  console.log('Uploaded:', response.document_id);
};

// List documents with pagination
const listDocs = async () => {
  const response = await documentsAPI.list({ limit: 20, offset: 0 });
  console.log('Total documents:', response.total);
};

// Query with RAG (complete response)
const queryDocuments = async (query: string) => {
  const response = await chatAPI.chatComplete({
    query,
    temperature: 0.7,
    max_tokens: 1000,
    use_perplexity: false
  });
  console.log('Answer:', response.answer);
  console.log('Sources:', response.sources);
};

// Get RAG statistics
const getStats = async () => {
  const stats = await ragAPI.getStats();
  console.log('Total queries:', stats.haystack.total_queries);
  console.log('Avg latency:', stats.haystack.avg_latency_ms, 'ms');
};

// Check queue health
const checkQueue = async () => {
  const health = await queueAPI.healthCheck();
  console.log('Queue healthy:', health.healthy);
  console.log('Queue depth:', health.queue_depth);
};
```

### cURL Examples

```bash
# Upload a PDF document
curl -X POST "http://localhost:8000/api/v1/documents/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@document.pdf"

# List documents
curl "http://localhost:8000/api/v1/documents?limit=10&offset=0"

# Query with RAG (complete response)
curl -X POST "http://localhost:8000/api/v1/chat/complete" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the main topic of the document?",
    "temperature": 0.7,
    "max_tokens": 1000
  }'

# Get RAG statistics
curl "http://localhost:8000/api/v1/rag/stats"

# Check queue health
curl "http://localhost:8000/api/v1/queue/health"

# Delete a document
curl -X DELETE "http://localhost:8000/api/v1/documents/{doc_id}"
```

### Python FastAPI Implementation

See the complete example in `backend-example/main.py` for a full implementation including:
- All health, document, chat, RAG, and queue endpoints
- Pydantic models matching the OpenAPI spec
- Mock implementations showing the expected behavior
- CORS configuration for frontend integration
- Server-Sent Events (SSE) for streaming chat
- Queue management with retry and dead-letter queues

To run the example backend:
```bash
cd backend-example
pip install -r requirements.txt
uvicorn main:app --reload
```

Then visit http://localhost:8000/docs for interactive API documentation.

## Updating the Frontend to Use the API

### Option 1: Using React Query (Recommended)

React Query is already configured in the app. Update hooks to use it:

```typescript
// Example: Update useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI } from '@/services/api';

export function useProjects() {
  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsAPI.list,
  });

  // Create project
  const createProject = useMutation({
    mutationFn: (data: { name: string; description: string }) => 
      projectsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Update project
  const updateProject = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      projectsAPI.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Delete project
  const deleteProject = useMutation({
    mutationFn: (id: string) => projectsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    projects,
    createProject: createProject.mutate,
    updateProject: updateProject.mutate,
    deleteProject: deleteProject.mutate,
  };
}
```

### Option 2: Direct API Calls

You can also use the API directly:

```typescript
import { projectsAPI } from '@/services/api';

// In your component
const handleCreateProject = async () => {
  try {
    const project = await projectsAPI.create({
      name: 'My Project',
      description: 'Description'
    });
    console.log('Created:', project);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## CORS Configuration

Make sure your FastAPI backend allows requests from your React dev server:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative port
        "https://your-production-domain.com"  # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## File Upload Handling

For document uploads, FastAPI expects `multipart/form-data`:

```python
from fastapi import File, UploadFile

@app.post("/api/v1/projects/{project_id}/documents")
async def upload_document(
    project_id: str,
    file: UploadFile = File(...)
):
    contents = await file.read()
    # Process the file
    return {
        "id": "doc123",
        "name": file.filename,
        "size": len(contents),
        "status": "processing"
    }
```

## Streaming Chat Responses

For real-time chat, use Server-Sent Events (SSE):

```python
from fastapi.responses import StreamingResponse
import asyncio

@app.post("/api/v1/projects/{project_id}/chat/stream")
async def stream_chat(project_id: str, request: ChatRequest):
    async def generate():
        response = "Your AI response here..."
        for char in response:
            yield f"data: {char}\n\n"
            await asyncio.sleep(0.01)
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream"
    )
```

Frontend streaming handler:

```typescript
const response = await chatAPI.streamMessage(projectId, message);
const reader = response.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  // Process chunk
}
```

## Environment Variables

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_API_TIMEOUT=30000
```

### Backend (.env)

```env
DATABASE_URL=postgresql://user:pass@localhost/db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Testing the Integration

1. **Start FastAPI backend:**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. **Start React frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test endpoints:**
   - Open browser console
   - Navigate to the app
   - Watch network tab for API calls
   - Check for CORS errors

## Error Handling

The API client includes comprehensive error handling:

```typescript
try {
  const projects = await projectsAPI.list();
} catch (error) {
  if (error instanceof APIError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Data:', error.data);
  }
}
```

## Deployment Considerations

### Production Environment

1. **Update .env for production:**
   ```env
   VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
   ```

2. **Build the frontend:**
   ```bash
   npm run build
   ```

3. **Serve static files from FastAPI:**
   ```python
   from fastapi.staticfiles import StaticFiles
   
   app.mount("/", StaticFiles(directory="dist", html=True), name="static")
   ```

### Security

- Use HTTPS in production
- Implement authentication (JWT, OAuth)
- Add rate limiting
- Validate all inputs
- Enable CORS only for specific origins

## Troubleshooting

### Common Issues

1. **CORS errors:**
   - Check FastAPI CORS middleware
   - Verify allowed origins include your frontend URL

2. **404 Not Found:**
   - Verify API base URL in `.env`
   - Check endpoint paths match backend routes

3. **Timeout errors:**
   - Increase `VITE_API_TIMEOUT`
   - Check backend performance

4. **Type errors:**
   - Ensure response types match TypeScript interfaces
   - Update `src/types/index.ts` if needed

## Next Steps

1. **Replace mock data:**
   - Update `useProjects.ts` to use React Query + API
   - Update `useChat.ts` for real chat backend
   - Update `usePromptLibrary.ts` for prompt storage

2. **Add authentication:**
   - Implement JWT tokens
   - Add auth context
   - Protect routes

3. **Implement real features:**
   - Document processing (OCR, parsing)
   - AI chat (OpenAI, Claude, etc.)
   - Vector search for RAG

4. **Optimize:**
   - Add caching
   - Implement pagination
   - Add loading states
   - Error boundaries

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [TypeScript Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## Support

For issues or questions:
1. Check FastAPI logs
2. Check browser console
3. Review network tab in DevTools
4. Verify environment variables

---

**Note:** This integration guide assumes you're building the FastAPI backend from scratch or adapting an existing one. Adjust endpoint paths and data models to match your specific requirements.
