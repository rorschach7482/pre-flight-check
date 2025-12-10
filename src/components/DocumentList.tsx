import { formatDistanceToNow } from 'date-fns';
import { FileText, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Document } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DocumentListProps {
  documents: Document[];
  onDelete: (documentId: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function StatusIcon({ status }: { status: Document['status'] }) {
  switch (status) {
    case 'uploading':
    case 'processing':
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    case 'ready':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-destructive" />;
  }
}

function statusLabel(status: Document['status']): string {
  switch (status) {
    case 'uploading':
      return 'Uploading...';
    case 'processing':
      return 'Processing...';
    case 'ready':
      return 'Ready';
    case 'error':
      return 'Error';
  }
}

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No documents uploaded yet</p>
        <p className="text-sm">Upload PDF files to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map(doc => (
        <div
          key={doc.id}
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg border border-border bg-card',
            doc.status === 'error' && 'border-destructive/50'
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{doc.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatFileSize(doc.size)}</span>
              <span>•</span>
              <span>{formatDistanceToNow(doc.uploadedAt, { addSuffix: true })}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <StatusIcon status={doc.status} />
              <span className="text-muted-foreground">{statusLabel(doc.status)}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onDelete(doc.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
