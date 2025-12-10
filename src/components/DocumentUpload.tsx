import { useCallback, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentUploadProps {
  onUpload: (file: File) => void;
}

export function DocumentUpload({ onUpload }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const pdfFiles = files.filter(file => file.type === 'application/pdf');
      pdfFiles.forEach(onUpload);
    },
    [onUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      files.forEach(onUpload);
      e.target.value = '';
    },
    [onUpload]
  );

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".pdf"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {isDragging ? (
              <FileText className="h-6 w-6 text-primary" />
            ) : (
              <Upload className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">
              {isDragging ? 'Drop your PDF here' : 'Upload PDF documents'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Drag and drop or click to browse
            </p>
          </div>
        </div>
      </label>
    </div>
  );
}
