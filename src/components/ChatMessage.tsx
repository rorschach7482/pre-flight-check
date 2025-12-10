import { useState } from 'react';
import { User, Bot, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === 'user';

  // Simple markdown rendering for bold and lists
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Bold text
      let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // List items
      if (processed.match(/^- /)) {
        processed = processed.replace(/^- /, '');
        return (
          <li key={i} className="ml-4" dangerouslySetInnerHTML={{ __html: processed }} />
        );
      }
      if (processed.match(/^\d+\. /)) {
        processed = processed.replace(/^\d+\. /, '');
        return (
          <li key={i} className="ml-4 list-decimal" dangerouslySetInnerHTML={{ __html: processed }} />
        );
      }
      
      if (!processed.trim()) {
        return <br key={i} />;
      }
      
      return (
        <p key={i} dangerouslySetInnerHTML={{ __html: processed }} />
      );
    });
  };

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          'flex-1 rounded-lg px-4 py-3 max-w-[80%]',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {renderContent(message.content)}
        </div>
        
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs font-medium hover:bg-transparent"
              onClick={() => setShowSources(!showSources)}
            >
              {showSources ? (
                <ChevronUp className="h-3 w-3 mr-1" />
              ) : (
                <ChevronDown className="h-3 w-3 mr-1" />
              )}
              {message.sources.length} source{message.sources.length !== 1 ? 's' : ''}
            </Button>
            
            {showSources && (
              <div className="mt-2 space-y-2">
                {message.sources.map((source, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2 rounded bg-background/50 text-xs"
                  >
                    <FileText className="h-3 w-3 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">
                        {source.documentName}
                        {source.page && <span className="text-muted-foreground"> (p. {source.page})</span>}
                      </p>
                      <p className="text-muted-foreground mt-1">"{source.excerpt}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
