/**
 * API Service for FastAPI Backend Integration
 * 
 * This service provides methods to interact with your FastAPI backend.
 * Configure the API base URL in your .env file using VITE_API_BASE_URL
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000;

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.detail || `HTTP error! status: ${response.status}`,
        response.status,
        response.statusText,
        errorData
      );
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof APIError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIError('Request timeout');
    }
    throw new APIError(error instanceof Error ? error.message : 'Network error');
  }
}

/**
 * API Client class
 */
export class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetchWithTimeout(url.toString(), { method: 'GET' });
    return response.json();
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  /**
   * Upload file using FormData
   */
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, string | number | boolean>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const response = await fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, browser will set it with boundary
      },
    });
    return response.json();
  }

  /**
   * Stream response for chat/SSE endpoints
   */
  async stream(endpoint: string, data?: unknown): Promise<ReadableStream<Uint8Array>> {
    const response = await fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.body) {
      throw new APIError('No response body for streaming');
    }

    return response.body;
  }
}

// Export a singleton instance
export const apiClient = new APIClient();

/**
 * RAG Chatbot API endpoints matching OpenAPI spec v1.0.0
 */

import type {
  HealthResponse,
  StatusResponse,
  CacheStatusResponse,
  ChatRequest,
  ChatResponse,
  DocumentUploadResponse,
  DocumentListResponse,
  DocumentDetailResponse,
  DocumentDeleteResponse,
  FrameworkStatusResponse,
  RAGStatsResponse,
  QueueStatusResponse,
  QueueHealthResponse,
  RetryDocumentResponse,
  DeadLetterQueueResponse,
  ReprocessAllDLQResponse,
  PurgeQueuesResponse,
  DocumentProcessingStatusResponse,
  ProcessRetryQueueResponse,
} from '../types';

// ============================================================================
// Health API
// ============================================================================

export const healthAPI = {
  /**
   * Root health check endpoint
   * GET /
   */
  root: () => apiClient.get<HealthResponse>('/'),

  /**
   * Get detailed system status including service connections
   * GET /status
   */
  getStatus: () => apiClient.get<StatusResponse>('/status'),

  /**
   * Get Redis cache status and statistics
   * GET /cache
   */
  getCacheStatus: () => apiClient.get<CacheStatusResponse>('/cache'),
};

// ============================================================================
// Documents API
// ============================================================================

export const documentsAPI = {
  /**
   * Upload a PDF document for indexing
   * POST /documents/upload
   */
  upload: (file: File) => 
    apiClient.uploadFile<DocumentUploadResponse>('/documents/upload', file),

  /**
   * List all uploaded documents
   * GET /documents
   */
  list: (params?: { limit?: number; offset?: number }) => 
    apiClient.get<DocumentListResponse>('/documents', params),

  /**
   * Get document details by ID
   * GET /documents/{doc_id}
   */
  get: (docId: string) => 
    apiClient.get<DocumentDetailResponse>(`/documents/${docId}`),

  /**
   * Delete a document by ID
   * DELETE /documents/{doc_id}
   */
  delete: (docId: string) => 
    apiClient.delete<DocumentDeleteResponse>(`/documents/${docId}`),
};

// ============================================================================
// Chat API
// ============================================================================

export const chatAPI = {
  /**
   * Query documents using RAG with streaming (SSE)
   * POST /chat
   */
  chat: (request: ChatRequest) => 
    apiClient.stream('/chat', request),

  /**
   * Non-streaming chat endpoint for complete responses
   * POST /chat/complete
   */
  chatComplete: (request: ChatRequest) => 
    apiClient.post<ChatResponse>('/chat/complete', request),
};

// ============================================================================
// RAG Framework API
// ============================================================================

export const ragAPI = {
  /**
   * Get the current active framework
   * GET /rag/framework
   */
  getFramework: () => 
    apiClient.get<FrameworkStatusResponse>('/rag/framework'),

  /**
   * Get performance statistics for Haystack framework
   * GET /rag/stats
   */
  getStats: () => 
    apiClient.get<RAGStatsResponse>('/rag/stats'),
};

// ============================================================================
// Queue API
// ============================================================================

export const queueAPI = {
  /**
   * Get current queue status and metrics
   * GET /queue/status
   */
  getStatus: () => 
    apiClient.get<QueueStatusResponse>('/queue/status'),

  /**
   * Health check endpoint for queue system
   * GET /queue/health
   */
  healthCheck: () => 
    apiClient.get<QueueHealthResponse>('/queue/health'),

  /**
   * Manually retry a specific document from dead-letter queue
   * POST /queue/retry/{document_id}
   */
  retryDocument: (documentId: string) => 
    apiClient.post<RetryDocumentResponse>(`/queue/retry/${documentId}`),

  /**
   * List documents in dead-letter queue
   * GET /queue/dead-letter
   */
  listDeadLetter: (params?: { limit?: number; offset?: number }) => 
    apiClient.get<DeadLetterQueueResponse>('/queue/dead-letter', params),

  /**
   * Reprocess all items in dead-letter queue
   * POST /queue/dead-letter/reprocess-all
   */
  reprocessAllDLQ: () => 
    apiClient.post<ReprocessAllDLQResponse>('/queue/dead-letter/reprocess-all'),

  /**
   * Clear all queues (admin operation)
   * DELETE /queue/purge
   */
  purgeAllQueues: () => 
    apiClient.delete<PurgeQueuesResponse>('/queue/purge'),

  /**
   * Get processing status of a specific document
   * GET /queue/document/{document_id}/status
   */
  getDocumentStatus: (documentId: string) => 
    apiClient.get<DocumentProcessingStatusResponse>(`/queue/document/${documentId}/status`),

  /**
   * Manually trigger processing of retry queue
   * POST /queue/process-retry-queue
   */
  processRetryQueue: () => 
    apiClient.post<ProcessRetryQueueResponse>('/queue/process-retry-queue'),
};

// ============================================================================
// Legacy API (kept for backward compatibility)
// ============================================================================

// Projects API
export const projectsAPI = {
  list: () => apiClient.get('/projects'),
  get: (id: string) => apiClient.get(`/projects/${id}`),
  create: (data: { name: string; description: string }) => apiClient.post('/projects', data),
  update: (id: string, data: { name?: string; description?: string }) => 
    apiClient.patch(`/projects/${id}`, data),
  delete: (id: string) => apiClient.delete(`/projects/${id}`),
};

// Legacy Documents API (for project-based documents)
export const legacyDocumentsAPI = {
  list: (projectId: string) => apiClient.get(`/projects/${projectId}/documents`),
  upload: (projectId: string, file: File) => 
    apiClient.uploadFile(`/projects/${projectId}/documents`, file),
  delete: (projectId: string, documentId: string) => 
    apiClient.delete(`/projects/${projectId}/documents/${documentId}`),
};

// Legacy Chat API (for project-based chat)
export const legacyChatAPI = {
  sendMessage: (projectId: string, message: string) => 
    apiClient.post(`/projects/${projectId}/chat`, { message }),
  streamMessage: (projectId: string, message: string) => 
    apiClient.stream(`/projects/${projectId}/chat/stream`, { message }),
  getHistory: (projectId: string) => apiClient.get(`/projects/${projectId}/chat/history`),
  clearHistory: (projectId: string) => apiClient.delete(`/projects/${projectId}/chat/history`),
};

// Prompts API
export const promptsAPI = {
  list: () => apiClient.get('/prompts'),
  get: (id: string) => apiClient.get(`/prompts/${id}`),
  create: (data: { title: string; content: string; category: string }) => 
    apiClient.post('/prompts', data),
  update: (id: string, data: { title?: string; content?: string; category?: string }) => 
    apiClient.patch(`/prompts/${id}`, data),
  delete: (id: string) => apiClient.delete(`/prompts/${id}`),
  toggleFavorite: (id: string) => apiClient.post(`/prompts/${id}/favorite`),
};
