# Pre-Flight Check - Compliance Document Review Application

A modern React + TypeScript frontend for reviewing compliance documents with AI assistance.

## 🔗 FastAPI Backend Integration

**📘 NEW:** This repository now includes everything you need to connect to a FastAPI backend!

- **[Quick Start Guide](QUICKSTART.md)** - Get connected in 5 minutes
- **[Integration Guide](FASTAPI_INTEGRATION.md)** - Complete backend integration documentation
- **[Architecture Overview](ARCHITECTURE.md)** - System architecture and data flow
- **[Example Backend](backend-example/)** - Fully functional FastAPI backend example

## Project info

**URL**: https://lovable.dev/projects/5f0677ef-36b3-4446-b2e3-e41a93ce6fae

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/5f0677ef-36b3-4446-b2e3-e41a93ce6fae) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

### Frontend Stack

- **React 18** - UI framework
- **TypeScript 5.8** - Type safety
- **Vite 5.4** - Build tool and dev server
- **React Router 6.30** - Client-side routing
- **TanStack Query 5.83** - Server state management
- **Tailwind CSS 3.4** - Utility-first CSS
- **shadcn/ui** - High-quality UI components (Radix UI)
- **React Hook Form + Zod** - Form validation

### Backend Integration

- **API Service Layer** - Ready-to-use FastAPI client
- **Example Backend** - Complete FastAPI backend implementation
- **TypeScript Types** - Full type safety for API responses

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/5f0677ef-36b3-4446-b2e3-e41a93ce6fae) and click on Share -> Publish.

## 🚀 Connecting to Your FastAPI Backend

### Quick Start (5 minutes)

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Start the example backend:**
   ```bash
   cd backend-example
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

3. **Start the frontend:**
   ```bash
   npm run dev
   ```

4. **Test the connection:**
   - Visit http://localhost:8000/docs for API documentation
   - Visit http://localhost:5173 for the app

**📖 For detailed instructions, see [QUICKSTART.md](QUICKSTART.md)**

## Features

- 📁 **Project Management** - Create and manage compliance review projects
- 📄 **Document Upload** - Upload and process compliance documents
- 💬 **AI Chat Interface** - Ask questions about your documents
- 📝 **Prompt Library** - Pre-built prompts for SOC 2, GDPR, Privacy Policy, and Terms of Service
- 🔄 **Real-time Updates** - Powered by React Query for optimal UX

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
