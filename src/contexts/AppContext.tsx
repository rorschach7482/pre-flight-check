import React, { createContext, useContext, ReactNode } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useChat } from '@/hooks/useChat';
import { usePromptLibrary } from '@/hooks/usePromptLibrary';

type AppContextType = ReturnType<typeof useProjects> &
  ReturnType<typeof useChat> &
  ReturnType<typeof usePromptLibrary>;

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const projectsState = useProjects();
  const chatState = useChat();
  const promptLibraryState = usePromptLibrary();

  const value: AppContextType = {
    ...projectsState,
    ...chatState,
    ...promptLibraryState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
