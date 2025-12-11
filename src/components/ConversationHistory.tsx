import { useState } from 'react';
import { MessageSquare, Trash2, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  messageCount: number;
}

interface ConversationHistoryProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

function groupConversationsByDate(conversations: Conversation[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const groups: Record<string, Conversation[]> = {
    'Today': [],
    'Yesterday': [],
    'Last 7 days': [],
    'Last month': [],
    'Older': []
  };

  conversations.forEach(conv => {
    const convDate = new Date(conv.timestamp.getFullYear(), conv.timestamp.getMonth(), conv.timestamp.getDate());
    
    if (convDate.getTime() === today.getTime()) {
      groups['Today'].push(conv);
    } else if (convDate.getTime() === yesterday.getTime()) {
      groups['Yesterday'].push(conv);
    } else if (convDate > weekAgo) {
      groups['Last 7 days'].push(conv);
    } else if (convDate > monthAgo) {
      groups['Last month'].push(conv);
    } else {
      groups['Older'].push(conv);
    }
  });

  return groups;
}

export function ConversationHistory({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation
}: ConversationHistoryProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Today': true,
    'Yesterday': true,
    'Last 7 days': true,
    'Last month': false,
    'Older': false
  });

  const groups = groupConversationsByDate(conversations);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button
          onClick={onNewConversation}
          className="w-full gap-2 rounded-lg bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groups).map(([groupName, groupConvs]) => {
          if (groupConvs.length === 0) return null;

          return (
            <div key={groupName} className="border-b border-border/50 last:border-b-0">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(groupName)}
                className="w-full flex items-center gap-2 px-4 py-3 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown
                  className={cn(
                    'h-3 w-3 transition-transform',
                    !expandedGroups[groupName] && '-rotate-90'
                  )}
                />
                {groupName}
              </button>

              {/* Group Conversations */}
              {expandedGroups[groupName] && (
                <div className="space-y-1 px-2 pb-2">
                  {groupConvs.map(conv => (
                    <div
                      key={conv.id}
                      className={cn(
                        'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors',
                        selectedConversationId === conv.id
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-accent/50 text-foreground'
                      )}
                      onClick={() => onSelectConversation(conv.id)}
                    >
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{conv.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {conv.messageCount} messages
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 p-4 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start a new chat to begin</p>
          </div>
        )}
      </div>
    </div>
  );
}
