import { useState } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Project } from '@/types';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { EditProjectModal } from '@/components/EditProjectModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { Button } from '@/components/ui/button';

export default function Projects() {
  const { projects, updateProject, deleteProject } = useApp();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const handleEdit = (project: Project) => {
    setEditingProject(project);
  };

  const handleDelete = (project: Project) => {
    setDeletingProject(project);
  };

  const handleEditSubmit = (id: string, name: string, description: string) => {
    updateProject(id, { name, description });
  };

  const handleDeleteConfirm = () => {
    if (deletingProject) {
      deleteProject(deletingProject.id);
      setDeletingProject(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage your compliance review projects
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="font-semibold text-lg mb-2">No projects yet</h2>
          <p className="text-muted-foreground mb-4 max-w-sm">
            Create your first project to start uploading compliance documents and asking questions.
          </p>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CreateProjectModal open={createOpen} onOpenChange={setCreateOpen} />
      <EditProjectModal
        open={!!editingProject}
        onOpenChange={open => !open && setEditingProject(null)}
        project={editingProject}
        onSubmit={handleEditSubmit}
      />
      <DeleteConfirmModal
        open={!!deletingProject}
        onOpenChange={open => !open && setDeletingProject(null)}
        title="Delete Project"
        description={`Are you sure you want to delete "${deletingProject?.name}"? This will also delete all documents and chat history.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
