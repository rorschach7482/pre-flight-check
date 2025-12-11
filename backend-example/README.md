# RAG Chatbot API - Example Backend

This is a complete example FastAPI backend implementing the RAG Chatbot API OpenAPI specification v1.0.0.

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
   - API: http://localhost:8000/api/v1
   - Interactive docs: http://localhost:8000/docs
   - Alternative docs: http://localhost:8000/redoc

## Features

- ✅ Complete RAG Chatbot API implementation
- ✅ CORS configured for React dev server
- ✅ PDF file upload support
- ✅ Streaming chat responses (SSE)
- ✅ Non-streaming chat endpoint
- ✅ Document queue management
- ✅ RAG framework statistics
- ✅ Interactive API documentation
- ✅ Full OpenAPI 3.1.0 spec compliance
- ✅ Type validation with Pydantic
- ✅ In-memory storage (replace with Supabase/PostgreSQL)

## API Endpoints

### Health Endpoints
- `GET /api/v1/` - Root health check
- `GET /api/v1/status` - Detailed system status
- `GET /api/v1/cache` - Redis cache status

### Document Endpoints
- `POST /api/v1/documents/upload` - Upload PDF document
- `GET /api/v1/documents` - List all documents (with pagination)
- `GET /api/v1/documents/{doc_id}` - Get document details
- `DELETE /api/v1/documents/{doc_id}` - Delete document

### Chat Endpoints
- `POST /api/v1/chat` - Query with RAG (streaming SSE)
- `POST /api/v1/chat/complete` - Query with RAG (complete response)

### RAG Framework Endpoints
- `GET /api/v1/rag/framework` - Get active framework
- `GET /api/v1/rag/stats` - Get performance statistics

### Queue Management Endpoints
- `GET /api/v1/queue/status` - Get queue status
- `GET /api/v1/queue/health` - Queue health check
- `POST /api/v1/queue/retry/{document_id}` - Retry document
- `GET /api/v1/queue/dead-letter` - List dead-letter queue
- `POST /api/v1/queue/dead-letter/reprocess-all` - Reprocess all DLQ items
- `DELETE /api/v1/queue/purge` - Purge all queues
- `GET /api/v1/queue/document/{document_id}/status` - Get document processing status
- `POST /api/v1/queue/process-retry-queue` - Process retry queue

## OpenAPI Specification

This backend implements the complete OpenAPI 3.1.0 specification for the RAG Chatbot API, including:

- **Multi-model RAG** powered by Haystack
- **Document processing** with PDF parsing, chunking, and embedding
- **Vector search** using Qdrant
- **Redis caching** for improved performance
- **Queue management** with retry and dead-letter queues
- **LLM integration** with OpenAI/Anthropic
- **Perplexity web context** enhancement (optional)

## Mock Implementation

This is a **mock implementation** for demonstration purposes. In production, you would integrate:

1. **Haystack** - For RAG pipeline and document processing
2. **Qdrant** - For vector storage and similarity search
3. **Redis** - For caching and queue management
4. **Supabase/PostgreSQL** - For document metadata storage
5. **OpenAI/Anthropic** - For LLM generation
6. **Perplexity** - For web context enhancement (optional)

## Production Deployment

For production deployment, implement:

### Required Services
- ✅ Database (Supabase/PostgreSQL) for document metadata
- ✅ Vector store (Qdrant) for embeddings
- ✅ Cache (Redis) for performance
- ✅ Message queue (Redis/RabbitMQ) for document processing
- ✅ Object storage (S3/MinIO) for PDF files
- ✅ LLM API (OpenAI/Anthropic) for generation

### Best Practices
- ✅ Environment variables for configuration
- ✅ Authentication and authorization
- ✅ Rate limiting and request validation
- ✅ Proper error handling and logging
- ✅ Monitoring and observability
- ✅ Production ASGI server (Gunicorn + Uvicorn)
- ✅ Docker containerization
- ✅ CI/CD pipeline

## Example Usage

```python
# Upload a document
curl -X POST "http://localhost:8000/api/v1/documents/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@document.pdf"

# Query with RAG (streaming)
curl -X POST "http://localhost:8000/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the main topic?", "stream": true}'

# Query with RAG (complete)
curl -X POST "http://localhost:8000/api/v1/chat/complete" \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the main topic?", "temperature": 0.7}'

# Get statistics
curl "http://localhost:8000/api/v1/rag/stats"
```

## Development

To extend this example:

1. Implement real Haystack RAG pipeline
2. Connect to Qdrant vector store
3. Integrate Redis for caching
4. Add Supabase/PostgreSQL for metadata
5. Implement document processing workers
6. Add authentication and authorization
7. Set up monitoring and logging
