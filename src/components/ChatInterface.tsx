import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { ChatMessage } from '@/components/ChatMessage';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';

interface ChatInterfaceProps {
  projectId: string;
  hasDocuments: boolean;
}

const SUGGESTED_PROMPTS = [
  'What are the key compliance requirements in my documents?',
  'Identify potential gaps in our security policies',
  'Summarize the data protection measures mentioned',
  'What are the access control requirements?',
];

export function ChatInterface({ projectId, hasDocuments }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const { getProjectMessages, sendMessage, isStreaming } = useApp();
  const messages = getProjectMessages(projectId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(projectId, input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  if (!hasDocuments) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">Upload documents to start chatting</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Upload your compliance documents on the left panel to begin asking questions.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Start a conversation</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              Ask questions about your compliance documents or try one of these prompts:
            </p>
            <div className="grid gap-2 w-full max-w-md">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="text-left h-auto py-3 px-4 justify-start"
                  onClick={() => handleSuggestedPrompt(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents..."
            className="min-h-[60px] resize-none"
            disabled={isStreaming}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
