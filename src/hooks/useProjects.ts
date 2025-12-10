import { useState, useCallback } from 'react';
import { Project, Document } from '@/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<Record<string, Document[]>>({});

  const createProject = useCallback((name: string, description: string) => {
    const newProject: Project = {
      id: generateId(),
      name,
      description,
      documentCount: 0,
      lastModified: new Date(),
      createdAt: new Date(),
    };
    setProjects(prev => [...prev, newProject]);
    setDocuments(prev => ({ ...prev, [newProject.id]: [] }));
    return newProject;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Pick<Project, 'name' | 'description'>>) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === id ? { ...p, ...updates, lastModified: new Date() } : p
      )
    );
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setDocuments(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const addDocument = useCallback((projectId: string, file: File) => {
    const newDoc: Document = {
      id: generateId(),
      projectId,
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
      status: 'uploading',
    };

    setDocuments(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), newDoc],
    }));

    // Simulate upload and processing
    setTimeout(() => {
      setDocuments(prev => ({
        ...prev,
        [projectId]: prev[projectId].map(d =>
          d.id === newDoc.id ? { ...d, status: 'processing' } : d
        ),
      }));
    }, 500);

    setTimeout(() => {
      setDocuments(prev => ({
        ...prev,
        [projectId]: prev[projectId].map(d =>
          d.id === newDoc.id ? { ...d, status: 'ready' } : d
        ),
      }));
      setProjects(prev =>
        prev.map(p =>
          p.id === projectId
            ? { ...p, documentCount: p.documentCount + 1, lastModified: new Date() }
            : p
        )
      );
    }, 2000);

    return newDoc;
  }, []);

  const deleteDocument = useCallback((projectId: string, documentId: string) => {
    setDocuments(prev => ({
      ...prev,
      [projectId]: prev[projectId].filter(d => d.id !== documentId),
    }));
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, documentCount: Math.max(0, p.documentCount - 1), lastModified: new Date() }
          : p
      )
    );
  }, []);

  const getProjectDocuments = useCallback(
    (projectId: string) => documents[projectId] || [],
    [documents]
  );

  return {
    projects,
    createProject,
    updateProject,
    deleteProject,
    addDocument,
    deleteDocument,
    getProjectDocuments,
  };
}
