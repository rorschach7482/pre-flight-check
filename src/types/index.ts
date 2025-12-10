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

export interface Source {
  documentName: string;
  excerpt: string;
  page?: number;
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
