import { ReactNode, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { CreateProjectModal } from '@/components/CreateProjectModal';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar onCreateProject={() => setCreateProjectOpen(true)} />
        <main className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border flex items-center px-4 gap-4">
            <SidebarTrigger />
          </header>
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
      <CreateProjectModal
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
      />
    </SidebarProvider>
  );
}
