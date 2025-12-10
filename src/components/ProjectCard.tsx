import { formatDistanceToNow } from 'date-fns';
import { FolderOpen, FileText, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-accent/50"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FolderOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{project.name}</CardTitle>
            <CardDescription className="text-xs">
              {formatDistanceToNow(project.lastModified, { addSuffix: true })}
            </CardDescription>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={e => {
                e.stopPropagation();
                onEdit(project);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={e => {
                e.stopPropagation();
                onDelete(project);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {project.description}
          </p>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <FileText className="h-3 w-3" />
          <span>
            {project.documentCount} document{project.documentCount !== 1 ? 's' : ''}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
