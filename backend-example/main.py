"""
Example FastAPI Backend for Pre-Flight Check Application

This is a complete example showing how to structure your FastAPI backend
to work with the React frontend.

To run this example:
1. Install dependencies: pip install fastapi uvicorn python-multipart
2. Run: uvicorn main:app --reload
3. API docs: http://localhost:8000/docs
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime
import asyncio
import uuid

app = FastAPI(
    title="Pre-Flight Check API",
    description="Backend API for compliance document review",
    version="1.0.0"
)

# CORS Configuration - Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative port
        # Add your production domain here
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Data Models
# ============================================================================

class ProjectCreate(BaseModel):
    name: str
    description: str

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    name: str
    description: str
    document_count: int
    last_modified: datetime
    created_at: datetime

class DocumentResponse(BaseModel):
    id: str
    project_id: str
    name: str
    size: int
    uploaded_at: datetime
    status: Literal["uploading", "processing", "ready", "error"]

class ChatRequest(BaseModel):
    message: str

class Source(BaseModel):
    document_name: str
    excerpt: str
    page: Optional[int] = None

class ChatMessage(BaseModel):
    id: str
    role: Literal["user", "assistant"]
    content: str
    timestamp: datetime
    sources: Optional[List[Source]] = None

class PromptCreate(BaseModel):
    title: str
    content: str
    category: Literal["SOC 2", "GDPR", "Privacy Policy", "Terms of Service"]

class PromptUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None

class PromptResponse(BaseModel):
    id: str
    title: str
    content: str
    category: str
    is_favorite: bool
    created_at: datetime


# ============================================================================
# In-Memory Storage (Replace with Database)
# ============================================================================

# These should be replaced with actual database operations
projects_db = {}
documents_db = {}
chat_history_db = {}
prompts_db = {}


# ============================================================================
# Projects API
# ============================================================================

@app.get("/api/v1/projects", response_model=List[ProjectResponse])
async def list_projects():
    """List all projects"""
    return list(projects_db.values())


@app.get("/api/v1/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str):
    """Get a specific project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    return projects_db[project_id]


@app.post("/api/v1/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(project: ProjectCreate):
    """Create a new project"""
    project_id = str(uuid.uuid4())
    now = datetime.now()
    
    new_project = ProjectResponse(
        id=project_id,
        name=project.name,
        description=project.description,
        document_count=0,
        last_modified=now,
        created_at=now
    )
    
    projects_db[project_id] = new_project
    documents_db[project_id] = []
    chat_history_db[project_id] = []
    
    return new_project


@app.patch("/api/v1/projects/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: str, updates: ProjectUpdate):
    """Update a project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = projects_db[project_id]
    
    if updates.name is not None:
        project.name = updates.name
    if updates.description is not None:
        project.description = updates.description
    
    project.last_modified = datetime.now()
    
    return project


@app.delete("/api/v1/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: str):
    """Delete a project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    del projects_db[project_id]
    if project_id in documents_db:
        del documents_db[project_id]
    if project_id in chat_history_db:
        del chat_history_db[project_id]
    
    return None


# ============================================================================
# Documents API
# ============================================================================

@app.get("/api/v1/projects/{project_id}/documents", response_model=List[DocumentResponse])
async def list_documents(project_id: str):
    """List all documents for a project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return documents_db.get(project_id, [])


@app.post("/api/v1/projects/{project_id}/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(project_id: str, file: UploadFile = File(...)):
    """Upload a document to a project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Read file content
    contents = await file.read()
    
    # Create document record
    document_id = str(uuid.uuid4())
    document = DocumentResponse(
        id=document_id,
        project_id=project_id,
        name=file.filename,
        size=len(contents),
        uploaded_at=datetime.now(),
        status="processing"
    )
    
    documents_db[project_id].append(document)
    
    # Update project document count
    projects_db[project_id].document_count += 1
    projects_db[project_id].last_modified = datetime.now()
    
    # TODO: Process document (extract text, create embeddings, etc.)
    # For now, simulate processing and mark as ready after a delay
    asyncio.create_task(mark_document_ready(project_id, document_id))
    
    return document


async def mark_document_ready(project_id: str, document_id: str):
    """Simulate document processing"""
    await asyncio.sleep(2)  # Simulate processing time
    
    for doc in documents_db.get(project_id, []):
        if doc.id == document_id:
            doc.status = "ready"
            break


@app.delete("/api/v1/projects/{project_id}/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(project_id: str, document_id: str):
    """Delete a document"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    documents = documents_db.get(project_id, [])
    documents_db[project_id] = [d for d in documents if d.id != document_id]
    
    # Update project document count
    projects_db[project_id].document_count = len(documents_db[project_id])
    projects_db[project_id].last_modified = datetime.now()
    
    return None


# ============================================================================
# Chat API
# ============================================================================

@app.post("/api/v1/projects/{project_id}/chat", response_model=ChatMessage)
async def send_chat_message(project_id: str, request: ChatRequest):
    """Send a chat message and get response"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Save user message
    user_message = ChatMessage(
        id=str(uuid.uuid4()),
        role="user",
        content=request.message,
        timestamp=datetime.now()
    )
    chat_history_db[project_id].append(user_message)
    
    # TODO: Generate AI response using your LLM
    # This is a mock response
    response_content = f"This is a mock response to: '{request.message}'. " \
                      f"In a real implementation, this would use an LLM to analyze " \
                      f"your documents and provide compliance insights."
    
    assistant_message = ChatMessage(
        id=str(uuid.uuid4()),
        role="assistant",
        content=response_content,
        timestamp=datetime.now(),
        sources=[
            Source(
                document_name="Example Document.pdf",
                excerpt="This is an example excerpt from a document...",
                page=1
            )
        ]
    )
    chat_history_db[project_id].append(assistant_message)
    
    return assistant_message


@app.post("/api/v1/projects/{project_id}/chat/stream")
async def stream_chat_message(project_id: str, request: ChatRequest):
    """Stream a chat response using Server-Sent Events"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    async def generate():
        # Mock streaming response
        response = f"This is a streaming response to your question about: {request.message}. " \
                  f"Each word appears one at a time to simulate real-time AI generation. " \
                  f"In production, this would stream tokens from your LLM."
        
        for word in response.split():
            yield f"data: {word} \n\n"
            await asyncio.sleep(0.05)  # Simulate word-by-word generation
        
        yield "data: [DONE]\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")


@app.get("/api/v1/projects/{project_id}/chat/history", response_model=List[ChatMessage])
async def get_chat_history(project_id: str):
    """Get chat history for a project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return chat_history_db.get(project_id, [])


@app.delete("/api/v1/projects/{project_id}/chat/history", status_code=status.HTTP_204_NO_CONTENT)
async def clear_chat_history(project_id: str):
    """Clear chat history for a project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    chat_history_db[project_id] = []
    return None


# ============================================================================
# Prompts API
# ============================================================================

@app.get("/api/v1/prompts", response_model=List[PromptResponse])
async def list_prompts():
    """List all prompts"""
    return list(prompts_db.values())


@app.get("/api/v1/prompts/{prompt_id}", response_model=PromptResponse)
async def get_prompt(prompt_id: str):
    """Get a specific prompt"""
    if prompt_id not in prompts_db:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return prompts_db[prompt_id]


@app.post("/api/v1/prompts", response_model=PromptResponse, status_code=status.HTTP_201_CREATED)
async def create_prompt(prompt: PromptCreate):
    """Create a new prompt"""
    prompt_id = str(uuid.uuid4())
    
    new_prompt = PromptResponse(
        id=prompt_id,
        title=prompt.title,
        content=prompt.content,
        category=prompt.category,
        is_favorite=False,
        created_at=datetime.now()
    )
    
    prompts_db[prompt_id] = new_prompt
    return new_prompt


@app.patch("/api/v1/prompts/{prompt_id}", response_model=PromptResponse)
async def update_prompt(prompt_id: str, updates: PromptUpdate):
    """Update a prompt"""
    if prompt_id not in prompts_db:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    prompt = prompts_db[prompt_id]
    
    if updates.title is not None:
        prompt.title = updates.title
    if updates.content is not None:
        prompt.content = updates.content
    if updates.category is not None:
        prompt.category = updates.category
    
    return prompt


@app.delete("/api/v1/prompts/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prompt(prompt_id: str):
    """Delete a prompt"""
    if prompt_id not in prompts_db:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    del prompts_db[prompt_id]
    return None


@app.post("/api/v1/prompts/{prompt_id}/favorite", response_model=PromptResponse)
async def toggle_favorite(prompt_id: str):
    """Toggle favorite status of a prompt"""
    if prompt_id not in prompts_db:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    prompt = prompts_db[prompt_id]
    prompt.is_favorite = not prompt.is_favorite
    
    return prompt


# ============================================================================
# Health Check
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }


# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
