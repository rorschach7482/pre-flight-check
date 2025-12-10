import { FolderOpen, BookOpen, Settings, Plus } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useApp } from '@/contexts/AppContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

interface AppSidebarProps {
  onCreateProject: () => void;
}

export function AppSidebar({ onCreateProject }: AppSidebarProps) {
  const { projects } = useApp();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            CC
          </div>
          {!collapsed && (
            <span className="font-semibold text-foreground">Compliance Chat</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/projects"
                    className="flex items-center gap-2"
                    activeClassName="bg-accent text-accent-foreground"
                  >
                    <FolderOpen className="h-4 w-4" />
                    {!collapsed && <span>Projects</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/prompts"
                    className="flex items-center gap-2"
                    activeClassName="bg-accent text-accent-foreground"
                  >
                    <BookOpen className="h-4 w-4" />
                    {!collapsed && <span>Prompt Library</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Projects</span>
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={onCreateProject}
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map(project => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={`/projects/${project.id}`}
                      className="flex items-center gap-2"
                      activeClassName="bg-accent text-accent-foreground"
                    >
                      <FolderOpen className="h-4 w-4" />
                      {!collapsed && (
                        <span className="truncate">{project.name}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {projects.length === 0 && !collapsed && (
                <p className="px-2 py-1 text-xs text-muted-foreground">
                  No projects yet
                </p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/settings"
                className="flex items-center gap-2"
                activeClassName="bg-accent text-accent-foreground"
              >
                <Settings className="h-4 w-4" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
