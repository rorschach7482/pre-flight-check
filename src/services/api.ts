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
    public data?: any
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
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
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
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
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
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
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
  async stream(endpoint: string, data?: any): Promise<ReadableStream<Uint8Array>> {
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
 * Example API endpoints
 * Uncomment and modify these based on your FastAPI backend structure
 */

// Projects API
export const projectsAPI = {
  list: () => apiClient.get('/projects'),
  get: (id: string) => apiClient.get(`/projects/${id}`),
  create: (data: { name: string; description: string }) => apiClient.post('/projects', data),
  update: (id: string, data: { name?: string; description?: string }) => 
    apiClient.patch(`/projects/${id}`, data),
  delete: (id: string) => apiClient.delete(`/projects/${id}`),
};

// Documents API
export const documentsAPI = {
  list: (projectId: string) => apiClient.get(`/projects/${projectId}/documents`),
  upload: (projectId: string, file: File) => 
    apiClient.uploadFile(`/projects/${projectId}/documents`, file),
  delete: (projectId: string, documentId: string) => 
    apiClient.delete(`/projects/${projectId}/documents/${documentId}`),
};

// Chat API
export const chatAPI = {
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
