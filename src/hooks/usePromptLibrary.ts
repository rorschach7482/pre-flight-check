import { useState, useCallback } from 'react';
import { Prompt, PromptCategory } from '@/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const DEFAULT_PROMPTS: Prompt[] = [
  {
    id: '1',
    title: 'SOC 2 Gap Analysis',
    content: 'Analyze my documents and identify gaps in SOC 2 Type II compliance. Focus on the security and availability trust service criteria.',
    category: 'SOC 2',
    isFavorite: true,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Access Control Review',
    content: 'Review the access control policies in my documents. Are they sufficient for SOC 2 compliance? What improvements are needed?',
    category: 'SOC 2',
    isFavorite: false,
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    title: 'GDPR Data Mapping',
    content: 'Help me identify all personal data processing activities mentioned in my documents. Create a data inventory for GDPR compliance.',
    category: 'GDPR',
    isFavorite: true,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    title: 'Consent Requirements',
    content: 'What consent mechanisms are described in my documents? Do they meet GDPR requirements for lawful basis of processing?',
    category: 'GDPR',
    isFavorite: false,
    createdAt: new Date('2024-02-10'),
  },
  {
    id: '5',
    title: 'Privacy Policy Audit',
    content: 'Review this privacy policy for completeness. Does it cover all required disclosures for GDPR, CCPA, and general best practices?',
    category: 'Privacy Policy',
    isFavorite: false,
    createdAt: new Date('2024-02-15'),
  },
  {
    id: '6',
    title: 'Data Collection Transparency',
    content: 'Analyze the data collection disclosures in my privacy policy. Is it clear what data is collected and how it is used?',
    category: 'Privacy Policy',
    isFavorite: false,
    createdAt: new Date('2024-02-20'),
  },
  {
    id: '7',
    title: 'Terms of Service Review',
    content: 'Review these terms of service for potential legal issues. Are liability limitations and user obligations clearly defined?',
    category: 'Terms of Service',
    isFavorite: false,
    createdAt: new Date('2024-03-01'),
  },
  {
    id: '8',
    title: 'Acceptable Use Policy',
    content: 'Does my terms of service adequately define acceptable use? What prohibited activities should be explicitly listed?',
    category: 'Terms of Service',
    isFavorite: false,
    createdAt: new Date('2024-03-05'),
  },
];

export function usePromptLibrary() {
  const [prompts, setPrompts] = useState<Prompt[]>(DEFAULT_PROMPTS);

  const createPrompt = useCallback((title: string, content: string, category: PromptCategory) => {
    const newPrompt: Prompt = {
      id: generateId(),
      title,
      content,
      category,
      isFavorite: false,
      createdAt: new Date(),
    };
    setPrompts(prev => [...prev, newPrompt]);
    return newPrompt;
  }, []);

  const updatePrompt = useCallback(
    (id: string, updates: Partial<Pick<Prompt, 'title' | 'content' | 'category'>>) => {
      setPrompts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    },
    []
  );

  const deletePrompt = useCallback((id: string) => {
    setPrompts(prev => prev.filter(p => p.id !== id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setPrompts(prev =>
      prev.map(p => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  }, []);

  return {
    prompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
  };
}
