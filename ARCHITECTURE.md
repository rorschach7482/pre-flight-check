# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         React Frontend                          │
│                    (Vite + TypeScript + React)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │   Pages     │  │  Components  │  │   React Query       │  │
│  │             │  │              │  │   (State Mgmt)      │  │
│  │ - Projects  │  │ - Layout     │  │                     │  │
│  │ - Project   │  │ - Chat       │  │ - Caching           │  │
│  │   Detail    │  │ - Documents  │  │ - Mutations         │  │
│  │ - Prompts   │  │ - Forms      │  │ - Invalidation      │  │
│  │ - Settings  │  │              │  │                     │  │
│  └─────────────┘  └──────────────┘  └─────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               Hooks (Data Management)                     │  │
│  │  - useProjects() - useChat() - usePromptLibrary()        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             API Service Layer (NEW)                       │  │
│  │  - APIClient class                                        │  │
│  │  - projectsAPI, documentsAPI, chatAPI, promptsAPI        │  │
│  │  - Error handling & Timeouts                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               │ HTTP/REST API
                               │ JSON + FormData
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       FastAPI Backend                           │
│                      (Python + FastAPI)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Endpoints                          │  │
│  │  /api/v1/projects       - CRUD operations                │  │
│  │  /api/v1/documents      - File uploads                   │  │
│  │  /api/v1/chat           - Chat & streaming               │  │
│  │  /api/v1/prompts        - Prompt management              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Business Logic                           │  │
│  │  - Document processing (PDF, DOCX, etc.)                 │  │
│  │  - Text extraction                                        │  │
│  │  - Embedding generation                                   │  │
│  │  - Vector storage/retrieval                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    AI/LLM Layer                           │  │
│  │  - OpenAI / Anthropic / Other LLM                        │  │
│  │  - RAG (Retrieval Augmented Generation)                  │  │
│  │  - Prompt engineering                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Data Layer                              │  │
│  │  - PostgreSQL / MongoDB (Metadata)                       │  │
│  │  - S3 / Object Storage (Files)                           │  │
│  │  - Pinecone / Weaviate (Vectors)                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Current State

### Frontend (Implemented)
- ✅ React 18 with TypeScript
- ✅ Vite for fast development
- ✅ React Router for navigation
- ✅ TanStack Query configured
- ✅ Tailwind CSS + shadcn/ui
- ✅ Complete UI components
- ✅ In-memory state management
- ✅ Mock data in hooks

### API Integration (New)
- ✅ API service layer created
- ✅ APIClient with all HTTP methods
- ✅ Pre-configured endpoints
- ✅ Error handling
- ✅ File upload support
- ✅ Streaming support
- ⏳ Hooks need to be updated to use API

### Backend (Example Provided)
- ✅ Complete FastAPI example
- ✅ All required endpoints
- ✅ CORS configured
- ✅ Pydantic models
- ✅ File upload handling
- ✅ Streaming responses
- ⏳ In-memory storage (needs DB)
- ⏳ Mock AI responses (needs LLM)
- ⏳ No document processing yet
- ⏳ No authentication yet

## Data Flow

### Creating a Project
```
User clicks "New Project"
    ↓
React form submission
    ↓
projectsAPI.create(data)
    ↓
POST /api/v1/projects
    ↓
FastAPI validates request
    ↓
Save to database
    ↓
Return project object
    ↓
React Query updates cache
    ↓
UI updates automatically
```

### Uploading a Document
```
User selects file
    ↓
documentsAPI.upload(projectId, file)
    ↓
POST /api/v1/projects/{id}/documents
    ↓
FastAPI receives file
    ↓
Save to object storage
    ↓
Extract text from document
    ↓
Generate embeddings
    ↓
Store in vector database
    ↓
Return document metadata
    ↓
UI shows upload progress
```

### Chat Interaction
```
User types message
    ↓
chatAPI.sendMessage(projectId, message)
    ↓
POST /api/v1/projects/{id}/chat
    ↓
FastAPI receives message
    ↓
Search relevant documents (vector search)
    ↓
Build context from documents
    ↓
Send to LLM with context
    ↓
Stream response back to frontend
    ↓
UI displays response in real-time
    ↓
Store in chat history
```

## Technology Stack

### Frontend
- **Framework:** React 18.3
- **Language:** TypeScript 5.8
- **Build Tool:** Vite 5.4
- **Routing:** React Router 6.30
- **State Management:** TanStack Query 5.83
- **Styling:** Tailwind CSS 3.4
- **UI Components:** shadcn/ui (Radix UI)
- **Form Handling:** React Hook Form + Zod

### Backend (Recommended)
- **Framework:** FastAPI 0.109+
- **Language:** Python 3.10+
- **Server:** Uvicorn (ASGI)
- **Validation:** Pydantic 2.5+
- **Database:** PostgreSQL 15+ (recommended)
- **Object Storage:** S3 / MinIO
- **Vector DB:** Pinecone / Weaviate / Qdrant
- **LLM:** OpenAI GPT-4 / Anthropic Claude

### Infrastructure (Production)
- **Frontend Hosting:** Vercel / Netlify / Cloudflare Pages
- **Backend Hosting:** AWS / GCP / Azure / Render
- **CDN:** Cloudflare
- **Monitoring:** Sentry / DataDog
- **CI/CD:** GitHub Actions

## API Specification

### Base URL
```
Development: http://localhost:8000/api/v1
Production: https://api.yourdomain.com/api/v1
```

### Authentication (Future)
```
Authorization: Bearer <JWT_TOKEN>
```

### Response Format
```json
{
  "id": "uuid",
  "name": "Project Name",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Error Format
```json
{
  "detail": "Error message",
  "status_code": 400,
  "type": "validation_error"
}
```

## Security Considerations

### Current (Development)
- No authentication
- No rate limiting
- CORS allows all from localhost
- In-memory storage

### Production Requirements
- JWT authentication
- API key for LLM services
- Rate limiting per user
- HTTPS only
- CORS restricted to specific domains
- Input validation
- File type validation
- File size limits
- SQL injection prevention (via ORM)
- XSS prevention (via React)

## Performance Considerations

### Frontend
- Code splitting by route
- Lazy loading of components
- React Query caching (5 min default)
- Optimistic updates for mutations
- Debounced search inputs

### Backend
- Database connection pooling
- Async I/O operations
- Background tasks for document processing
- CDN for static files
- Response compression
- Database indexing

## Scalability

### Horizontal Scaling
- Stateless API servers
- Load balancer in front of API
- Shared cache (Redis)
- Object storage for files
- Separate vector DB cluster

### Vertical Scaling
- Optimize database queries
- Cache frequently accessed data
- Use background workers for heavy tasks
- Implement pagination
- Stream large responses

## Development Workflow

```
1. Start Backend:
   cd backend-example
   uvicorn main:app --reload

2. Start Frontend:
   npm run dev

3. Develop:
   - Make changes to components
   - Hot reload happens automatically
   - Test API calls in browser console

4. Test:
   - Frontend: npm run test
   - Backend: pytest

5. Build:
   - Frontend: npm run build
   - Backend: docker build

6. Deploy:
   - Push to GitHub
   - CI/CD automatically deploys
```

## Future Enhancements

### Phase 1 (Core Features)
- [ ] Connect frontend to real API
- [ ] Implement database storage
- [ ] Add basic authentication
- [ ] Implement document processing
- [ ] Integrate LLM for chat

### Phase 2 (Advanced Features)
- [ ] Vector search for RAG
- [ ] Multi-user support
- [ ] Role-based access control
- [ ] Advanced document analysis
- [ ] Custom AI models

### Phase 3 (Enterprise)
- [ ] SSO integration
- [ ] Audit logging
- [ ] Advanced analytics
- [ ] White-label support
- [ ] Multi-tenant architecture

## Resources

- Frontend: `src/` directory
- Backend Example: `backend-example/` directory
- API Documentation: http://localhost:8000/docs
- Integration Guide: `FASTAPI_INTEGRATION.md`
