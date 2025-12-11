# Quick Start Guide: Connecting to FastAPI Backend

This guide will help you quickly connect your React frontend to a FastAPI backend.

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Code editor (VS Code recommended)

## 🚀 Option 1: Test with Example Backend (Fastest)

### Step 1: Start the Example Backend

```bash
# Navigate to backend example
cd backend-example

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

The backend will be available at: http://localhost:8000

✅ **Test it:** Visit http://localhost:8000/docs to see the API documentation

### Step 2: Configure Frontend

```bash
# Navigate back to project root
cd ..

# Create .env file
cp .env.example .env
```

The `.env` file should contain:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_API_TIMEOUT=30000
```

### Step 3: Install Frontend Dependencies

```bash
npm install
```

### Step 4: Start Frontend

```bash
npm run dev
```

The frontend will be available at: http://localhost:5173

### Step 5: Test the Integration

At this point, the frontend is **still using mock data**. To connect it to the backend, you need to update the hooks (see Step 6 below).

For now, you can test the API directly:

1. Open browser console (F12)
2. Run this code:
```javascript
import { projectsAPI } from './src/services/api';

// Test creating a project
const project = await projectsAPI.create({
  name: 'Test Project',
  description: 'Testing API connection'
});
console.log('Created:', project);

// Test listing projects
const projects = await projectsAPI.list();
console.log('Projects:', projects);
```

### Step 6: Update Hooks to Use API (Manual)

Update `src/hooks/useProjects.ts` to use the API instead of mock data:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI } from '@/services/api';
import { Project } from '@/types';

export function useProjects() {
  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.list(),
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      projectsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Pick<Project, 'name' | 'description'>> }) =>
      projectsAPI.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => projectsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    projects,
    createProject: (name: string, description: string) => 
      createProjectMutation.mutate({ name, description }),
    updateProject: (id: string, updates: Partial<Pick<Project, 'name' | 'description'>>) =>
      updateProjectMutation.mutate({ id, updates }),
    deleteProject: (id: string) => deleteProjectMutation.mutate(id),
    // ... document methods need similar updates
  };
}
```

Repeat similar changes for:
- `src/hooks/useChat.ts`
- `src/hooks/usePromptLibrary.ts`

---

## 🏗️ Option 2: Build Your Own Backend

### Step 1: Create Your FastAPI Project

```bash
# Create backend directory
mkdir backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install FastAPI
pip install fastapi uvicorn python-multipart sqlalchemy psycopg2-binary

# Create main.py
touch main.py
```

### Step 2: Implement Required Endpoints

Copy the structure from `backend-example/main.py` and implement:

**Required Endpoints:**
```python
# Projects
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/{id}
PATCH  /api/v1/projects/{id}
DELETE /api/v1/projects/{id}

# Documents
GET    /api/v1/projects/{id}/documents
POST   /api/v1/projects/{id}/documents
DELETE /api/v1/projects/{id}/documents/{doc_id}

# Chat
POST   /api/v1/projects/{id}/chat
POST   /api/v1/projects/{id}/chat/stream
GET    /api/v1/projects/{id}/chat/history
DELETE /api/v1/projects/{id}/chat/history

# Prompts
GET    /api/v1/prompts
POST   /api/v1/prompts
PATCH  /api/v1/prompts/{id}
DELETE /api/v1/prompts/{id}
POST   /api/v1/prompts/{id}/favorite
```

### Step 3: Add CORS Middleware

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Step 4: Add Database (Optional but Recommended)

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://user:password@localhost/dbname"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

### Step 5: Run Your Backend

```bash
uvicorn main:app --reload
```

### Step 6: Configure Frontend

Follow Option 1, Steps 2-6 above.

---

## 📊 Verifying the Connection

### Check 1: Backend Health

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000000"
}
```

### Check 2: API Documentation

Visit: http://localhost:8000/docs

You should see Swagger UI with all your endpoints.

### Check 3: Create a Test Project

```bash
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"Test project"}'
```

### Check 4: Frontend API Call

In browser console (F12):
```javascript
fetch('http://localhost:8000/api/v1/projects')
  .then(r => r.json())
  .then(console.log)
```

### Check 5: Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Use the app
4. Check for XHR/Fetch requests to `localhost:8000`

---

## 🐛 Troubleshooting

### Problem: CORS Error

**Symptom:**
```
Access to fetch at 'http://localhost:8000/api/v1/projects' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
Check your FastAPI CORS middleware includes `http://localhost:5173`:
```python
allow_origins=["http://localhost:5173"]
```

### Problem: 404 Not Found

**Symptom:**
```
GET http://localhost:8000/api/v1/projects 404 (Not Found)
```

**Solution:**
- Verify your FastAPI routes start with `/api/v1`
- Check `.env` file has correct `VITE_API_BASE_URL`
- Restart both frontend and backend

### Problem: Connection Refused

**Symptom:**
```
Failed to fetch
```

**Solution:**
- Make sure FastAPI backend is running (`uvicorn main:app --reload`)
- Check port 8000 is not used by another application
- Verify backend URL in `.env` file

### Problem: Frontend Still Uses Mock Data

**Symptom:**
Projects are created but disappear after refresh.

**Solution:**
You need to update the hooks to use the API service. See Step 6 in Option 1 above.

---

## 📚 Next Steps

### 1. Implement Real Features

- [ ] Add database storage (PostgreSQL recommended)
- [ ] Implement document processing (PyPDF2, python-docx)
- [ ] Integrate LLM (OpenAI, Anthropic, or local models)
- [ ] Add vector database for RAG (Pinecone, Weaviate)

### 2. Add Authentication

- [ ] Implement JWT tokens
- [ ] Add user registration/login
- [ ] Protect API endpoints
- [ ] Add user context to frontend

### 3. Enhance Features

- [ ] Real-time chat streaming
- [ ] Document preview
- [ ] Advanced search
- [ ] Export reports
- [ ] Analytics dashboard

### 4. Deploy to Production

- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Set up CI/CD pipeline
- [ ] Deploy frontend (Vercel/Netlify)
- [ ] Deploy backend (AWS/GCP/Azure)

---

## 📖 Additional Resources

- **Full Integration Guide:** See `FASTAPI_INTEGRATION.md`
- **Architecture Overview:** See `ARCHITECTURE.md`
- **API Documentation:** http://localhost:8000/docs (when backend is running)
- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **React Query Docs:** https://tanstack.com/query/latest

---

## 💡 Tips

1. **Start Small:** Get one endpoint working first (e.g., list projects)
2. **Use API Docs:** FastAPI's `/docs` endpoint is invaluable for testing
3. **Check Browser Console:** Most issues show errors in the console
4. **Use Network Tab:** See exactly what requests are being made
5. **Read Error Messages:** FastAPI provides detailed error messages

## 🎯 Quick Test Script

Create a file `test-api.sh` to quickly test your backend:

```bash
#!/bin/bash

echo "Testing backend API..."

# Health check
echo "\n1. Health Check:"
curl -s http://localhost:8000/health | jq

# Create project
echo "\n2. Create Project:"
curl -s -X POST http://localhost:8000/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","description":"Testing"}' | jq

# List projects
echo "\n3. List Projects:"
curl -s http://localhost:8000/api/v1/projects | jq

echo "\n✅ API tests complete!"
```

Make it executable and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

**Need Help?** Check the integration guide or review the example backend code for reference.
