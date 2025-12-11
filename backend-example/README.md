# Example FastAPI Backend

This is a complete example FastAPI backend that works with the React frontend.

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the server:**
   ```bash
   uvicorn main:app --reload
   ```

3. **Access the API:**
   - API: http://localhost:8000
   - Interactive docs: http://localhost:8000/docs
   - Alternative docs: http://localhost:8000/redoc

## Features

- ✅ All required endpoints for the frontend
- ✅ CORS configured for React dev server
- ✅ File upload support
- ✅ Streaming chat responses (SSE)
- ✅ Interactive API documentation
- ✅ Type validation with Pydantic
- ✅ In-memory storage (replace with database)

## Endpoints

### Projects
- `GET /api/v1/projects` - List all projects
- `GET /api/v1/projects/{id}` - Get project details
- `POST /api/v1/projects` - Create project
- `PATCH /api/v1/projects/{id}` - Update project
- `DELETE /api/v1/projects/{id}` - Delete project

### Documents
- `GET /api/v1/projects/{id}/documents` - List documents
- `POST /api/v1/projects/{id}/documents` - Upload document
- `DELETE /api/v1/projects/{id}/documents/{doc_id}` - Delete document

### Chat
- `POST /api/v1/projects/{id}/chat` - Send message
- `POST /api/v1/projects/{id}/chat/stream` - Stream response
- `GET /api/v1/projects/{id}/chat/history` - Get history
- `DELETE /api/v1/projects/{id}/chat/history` - Clear history

### Prompts
- `GET /api/v1/prompts` - List prompts
- `POST /api/v1/prompts` - Create prompt
- `PATCH /api/v1/prompts/{id}` - Update prompt
- `DELETE /api/v1/prompts/{id}` - Delete prompt
- `POST /api/v1/prompts/{id}/favorite` - Toggle favorite

## Next Steps

1. **Replace in-memory storage** with a database (PostgreSQL, MongoDB, etc.)
2. **Implement real AI chat** using OpenAI, Anthropic, or other LLM providers
3. **Add document processing** (PDF parsing, text extraction, embeddings)
4. **Implement authentication** (JWT tokens, OAuth)
5. **Add vector search** for document retrieval (Pinecone, Weaviate, etc.)

## Production Deployment

For production, consider:
- Using a proper database
- Adding authentication and authorization
- Implementing rate limiting
- Using environment variables for configuration
- Setting up proper logging and monitoring
- Using a production ASGI server (Gunicorn + Uvicorn)
