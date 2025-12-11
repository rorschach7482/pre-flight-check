# FastAPI Backend Integration Guide

This guide explains how to connect your React frontend to a FastAPI backend.

## Overview

This application is a **React + TypeScript** frontend built with:
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TanStack Query (React Query)** - Server state management
- **Tailwind CSS + shadcn/ui** - Styling

Currently, the app uses **in-memory state** with mock data. This guide shows you how to connect it to your FastAPI backend.

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

### Step 2: Start Your FastAPI Backend

Make sure your FastAPI backend is running on the configured URL (e.g., `http://localhost:8000`).

### Step 3: Update Frontend to Use API

The API service layer is already created in `src/services/api.ts`. Now you need to update the hooks to use it instead of mock data.

## API Service Layer

### API Client Features

The `api.ts` file provides:

- **APIClient class** - Generic HTTP client with methods:
  - `get<T>()` - GET requests
  - `post<T>()` - POST requests
  - `put<T>()` - PUT requests
  - `patch<T>()` - PATCH requests
  - `delete<T>()` - DELETE requests
  - `uploadFile<T>()` - File uploads with FormData
  - `stream()` - Streaming responses for chat

- **Error handling** - Custom APIError class with status codes
- **Timeout support** - Configurable request timeouts
- **Pre-configured endpoints** - Ready-to-use API methods

### Example API Endpoints

The service includes example endpoints for:

```typescript
// Projects
projectsAPI.list()
projectsAPI.create({ name: "...", description: "..." })
projectsAPI.update(id, { name: "..." })
projectsAPI.delete(id)

// Documents
documentsAPI.list(projectId)
documentsAPI.upload(projectId, file)
documentsAPI.delete(projectId, documentId)

// Chat
chatAPI.sendMessage(projectId, message)
chatAPI.streamMessage(projectId, message)
chatAPI.getHistory(projectId)
chatAPI.clearHistory(projectId)

// Prompts
promptsAPI.list()
promptsAPI.create({ title: "...", content: "...", category: "..." })
promptsAPI.toggleFavorite(id)
```

## Required FastAPI Backend Endpoints

Your FastAPI backend should implement these endpoints:

### Projects API

```python
# GET /api/v1/projects - List all projects
# POST /api/v1/projects - Create project
# GET /api/v1/projects/{id} - Get project details
# PATCH /api/v1/projects/{id} - Update project
# DELETE /api/v1/projects/{id} - Delete project
```

**Request/Response Models:**

```python
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
```

### Documents API

```python
# GET /api/v1/projects/{project_id}/documents - List documents
# POST /api/v1/projects/{project_id}/documents - Upload document
# DELETE /api/v1/projects/{project_id}/documents/{document_id} - Delete document
```

**Request/Response Models:**

```python
class DocumentResponse(BaseModel):
    id: str
    project_id: str
    name: str
    size: int
    uploaded_at: datetime
    status: Literal["uploading", "processing", "ready", "error"]
```

### Chat API

```python
# POST /api/v1/projects/{project_id}/chat - Send message
# POST /api/v1/projects/{project_id}/chat/stream - Stream response (SSE)
# GET /api/v1/projects/{project_id}/chat/history - Get chat history
# DELETE /api/v1/projects/{project_id}/chat/history - Clear history
```

**Request/Response Models:**

```python
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
```

### Prompts API

```python
# GET /api/v1/prompts - List all prompts
# POST /api/v1/prompts - Create prompt
# GET /api/v1/prompts/{id} - Get prompt
# PATCH /api/v1/prompts/{id} - Update prompt
# DELETE /api/v1/prompts/{id} - Delete prompt
# POST /api/v1/prompts/{id}/favorite - Toggle favorite
```

**Request/Response Models:**

```python
class PromptCreate(BaseModel):
    title: str
    content: str
    category: Literal["SOC 2", "GDPR", "Privacy Policy", "Terms of Service"]

class PromptResponse(BaseModel):
    id: str
    title: str
    content: str
    category: str
    is_favorite: bool
    created_at: datetime
```

## Example FastAPI Backend Structure

Here's a minimal FastAPI backend structure:

```python
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ProjectCreate(BaseModel):
    name: str
    description: str

class ProjectResponse(BaseModel):
    id: str
    name: str
    description: str
    document_count: int
    last_modified: datetime
    created_at: datetime

# Routes
@app.get("/api/v1/projects")
async def list_projects() -> List[ProjectResponse]:
    # Your implementation
    return []

@app.post("/api/v1/projects")
async def create_project(project: ProjectCreate) -> ProjectResponse:
    # Your implementation
    pass

@app.post("/api/v1/projects/{project_id}/documents")
async def upload_document(project_id: str, file: UploadFile = File(...)):
    # Your implementation
    pass

@app.post("/api/v1/projects/{project_id}/chat")
async def send_chat_message(project_id: str, request: ChatRequest):
    # Your implementation
    pass
```

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
