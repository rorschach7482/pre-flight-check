import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInterface } from './ChatInterface';
import { ConversationHistory } from './ConversationHistory';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  messageCount: number;
}

interface EnhancedChatLayoutProps {
  projectId: string;
  hasDocuments: boolean;
  conversations?: Conversation[];
  onSelectConversation?: (id: string) => void;
  onNewConversation?: () => void;
  onDeleteConversation?: (id: string) => void;
}

export function EnhancedChatLayout({
  projectId,
  hasDocuments,
  conversations = [],
  onSelectConversation,
  onNewConversation,
  onDeleteConversation
}: EnhancedChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    onSelectConversation?.(id);
  };

  const handleNewConversation = () => {
    setSelectedConversationId(null);
    onNewConversation?.();
  };

  const handleDeleteConversation = (id: string) => {
    if (selectedConversationId === id) {
      setSelectedConversationId(null);
    }
    onDeleteConversation?.(id);
  };

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar Toggle Button (Mobile) */}
      <div className="md:hidden absolute top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          'flex-none transition-all duration-300 bg-background',
          sidebarOpen ? 'w-64' : 'w-0',
          'md:w-64'
        )}
      >
        {sidebarOpen && (
          <ConversationHistory
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
          />
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden pt-12 md:pt-0">
        <ChatInterface
          projectId={projectId}
          hasDocuments={hasDocuments}
        />
      </div>
    </div>
  );
}
