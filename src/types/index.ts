// ============================================================================
// Health & Status Types
// ============================================================================

export interface HealthResponse {
  status: string;
  message?: string;
  rag_framework?: string;
  version?: string;
}

export interface StatusResponse {
  status: string;
  rag_framework: string;
  version: string;
  services?: Record<string, unknown>;
}

export interface CacheStatusResponse {
  status: string;
  total_keys: number;
  memory_usage: string;
  error?: string | null;
}

// ============================================================================
// Chat Types
// ============================================================================

export interface ChatRequest {
  query: string;
  doc_id?: string | null;
  framework?: 'haystack';
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  use_perplexity?: boolean;
}

export interface Source {
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface ChatResponse {
  answer: string;
  sources?: Source[];
  framework: string;
  tokens_used: number;
  latency_ms: number;
  cached?: boolean;
  web_context?: string | null;
  prompt_metadata?: Record<string, unknown> | null;
}

// ============================================================================
// Document Types
// ============================================================================

export interface DocumentUploadResponse {
  document_id: string;
  filename: string;
  status: string;
  uploaded_at: string;
  framework: string;
}

export interface DocumentListItem {
  document_id: string;
  filename: string;
  uploaded_at: string;
  status: string;
  framework: string;
  size?: number | null;
}

export interface DocumentListResponse {
  documents: DocumentListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface DocumentDetailResponse {
  document_id: string;
  filename: string;
  uploaded_at: string;
  indexed_at?: string | null;
  status: string;
  framework: string;
  size?: number | null;
  chunks?: number | null;
  metadata?: Record<string, unknown>;
}

export interface DocumentDeleteResponse {
  status: string;
  message: string;
  document_id: string;
  filename: string;
}

// ============================================================================
// RAG Framework Types
// ============================================================================

export interface FrameworkStatusResponse {
  framework: string;
  available_frameworks: string[];
}

export interface RAGStatsResponse {
  current_framework: string;
  haystack: {
    total_queries: number;
    avg_latency_ms: number;
    p95_latency_ms: number;
    p99_latency_ms: number;
    cache_hit_rate: number;
    error_rate: number;
  };
}

// ============================================================================
// Queue Types
// ============================================================================

export interface QueueStatusResponse {
  success: boolean;
  queue: Record<string, unknown>;
  timestamp: string;
}

export interface QueueHealthResponse {
  healthy: boolean;
  queue_depth: number;
  processing: number;
  retry: number;
  dead_letter: number;
  timestamp: string;
}

export interface RetryDocumentResponse {
  success: boolean;
  message: string;
  document_id: string;
}

export interface DeadLetterQueueResponse {
  success: boolean;
  count: number;
  limit: number;
  offset: number;
  items: Record<string, unknown>[];
}

export interface ReprocessAllDLQResponse {
  success: boolean;
  message: string;
  reprocessed_count: number;
  total_dlq_items: number;
}

export interface PurgeQueuesResponse {
  success: boolean;
  message: string;
  purged: Record<string, unknown>;
}

export interface DocumentProcessingStatusResponse {
  success: boolean;
  status: string;
  details?: Record<string, unknown> | null;
}

export interface ProcessRetryQueueResponse {
  success: boolean;
  message: string;
  moved_count: number;
}

// ============================================================================
// Legacy Types (kept for backward compatibility)
// ============================================================================

export interface Project {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  lastModified: Date;
  createdAt: Date;
}

export interface Document {
  id: string;
  projectId: string;
  name: string;
  size: number;
  uploadedAt: Date;
  status: 'uploading' | 'processing' | 'ready' | 'error';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Source[];
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: PromptCategory;
  isFavorite: boolean;
  createdAt: Date;
}

export type PromptCategory = 'SOC 2' | 'GDPR' | 'Privacy Policy' | 'Terms of Service';

export const PROMPT_CATEGORIES: PromptCategory[] = [
  'SOC 2',
  'GDPR',
  'Privacy Policy',
  'Terms of Service',
];
