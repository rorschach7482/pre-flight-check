import { useParams, Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { DocumentUpload } from '@/components/DocumentUpload';
import { DocumentList } from '@/components/DocumentList';
import { ChatInterface } from '@/components/ChatInterface';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, getProjectDocuments, addDocument, deleteDocument } = useApp();

  const project = projects.find(p => p.id === projectId);
  const documents = projectId ? getProjectDocuments(projectId) : [];

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  const handleUpload = (file: File) => {
    if (projectId) {
      addDocument(projectId, file);
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    if (projectId) {
      deleteDocument(projectId, documentId);
    }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
          <div className="h-full flex flex-col border-r border-border">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-lg">{project.name}</h2>
              {project.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {project.description}
                </p>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <DocumentUpload onUpload={handleUpload} />
              <DocumentList documents={documents} onDelete={handleDeleteDocument} />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={65}>
          <ChatInterface
            projectId={projectId!}
            hasDocuments={documents.some(d => d.status === 'ready')}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
