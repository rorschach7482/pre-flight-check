import { useState } from 'react';
import { MessageSquare, FileText, ChevronDown, ChevronUp, Send, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { ChatContainerRoot, ChatContainerContent, ChatContainerScrollAnchor } from '@/components/ui/chat-container';
import { Message, MessageAvatar, MessageContent, MessageActions, MessageAction } from '@/components/ui/message';
import { PromptInput, PromptInputTextarea, PromptInputActions } from '@/components/ui/prompt-input';
import { ThinkingBar, FeedbackBar, TextShimmer } from './StreamingComponents';
import { cn } from '@/lib/utils';

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
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [feedbackMessageId, setFeedbackMessageId] = useState<string | null>(null);
  const { getProjectMessages, sendMessage, isStreaming } = useApp();
  const messages = getProjectMessages(projectId);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(projectId, input.trim());
    setInput('');
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const toggleSources = (messageId: string) => {
    setExpandedSources(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
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
    <div className="flex flex-col h-full bg-background">
      <ChatContainerRoot className="flex-1 px-4 md:px-8 lg:px-16 py-6">
        <ChatContainerContent className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 space-y-6">
              <div className="space-y-2">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto" />
                <h2 className="font-bold text-2xl md:text-3xl text-foreground">Start a conversation</h2>
                <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed">
                  Ask questions about your compliance documents or try one of these suggested prompts to get started:
                </p>
              </div>
              <div className="grid gap-3 w-full max-w-2xl">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="group text-left rounded-xl border border-border p-4 transition-all hover:border-primary hover:bg-accent/70 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-foreground group-hover:text-primary">{prompt}</span>
                      <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map(message => {
                const isUser = message.role === 'user';
                return (
                  <Message
                    key={message.id}
                    className={cn('gap-4 animate-in fade-in-0 slide-in-from-bottom-2 group py-2', isUser && 'flex-row-reverse')}
                  >
                    <MessageAvatar
                      src={isUser ? 'U' : 'A'}
                      alt={isUser ? 'User' : 'Assistant'}
                      fallback={isUser ? 'U' : 'A'}
                      className={cn(
                        'h-9 w-9 mt-1 shrink-0 flex items-center justify-center text-sm font-semibold',
                        isUser ? 'bg-primary text-primary-foreground rounded-full' : 'bg-muted text-muted-foreground rounded-full'
                      )}
                    />
                    <div className={cn('flex-1 flex gap-3 max-w-3xl', isUser && 'flex-row-reverse')}>
                      <div className="flex-1 space-y-2">
                        <MessageContent
                          markdown
                          className={cn(
                            'inline-block rounded-2xl px-5 py-3 break-words text-base leading-relaxed',
                            isUser
                              ? 'bg-primary text-primary-foreground rounded-br-none'
                              : 'bg-secondary text-foreground rounded-bl-none'
                          )}
                        >
                          {message.content}
                        </MessageContent>

                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-border/50 space-y-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-xs font-semibold hover:bg-transparent text-muted-foreground hover:text-foreground uppercase tracking-wide"
                              onClick={() => toggleSources(message.id)}
                            >
                              {expandedSources[message.id] ? (
                                <ChevronUp className="h-4 w-4 mr-1.5" />
                              ) : (
                                <ChevronDown className="h-4 w-4 mr-1.5" />
                              )}
                              {message.sources.length} source{message.sources.length !== 1 ? 's' : ''}
                            </Button>

                            {expandedSources[message.id] && (
                              <div className="mt-3 space-y-2">
                                {message.sources.map((source, i) => (
                                  <div
                                    key={i}
                                    className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border text-xs hover:bg-muted/70 transition-colors"
                                  >
                                    <FileText className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                                    <div className="flex-1">
                                      <p className="font-semibold text-foreground leading-tight">
                                        {source.documentName}
                                        {source.page && <span className="text-muted-foreground font-normal ml-2">(p. {source.page})</span>}
                                      </p>
                                      <p className="text-muted-foreground mt-2 italic">"{source.excerpt}"</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Feedback bar for assistant messages */}
                    {!isUser && feedbackMessageId === message.id && (
                      <div className="mt-3">
                        <FeedbackBar
                          title="Was this response helpful?"
                          onHelpful={() => {
                            console.log('Helpful:', message.id);
                            setFeedbackMessageId(null);
                          }}
                          onNotHelpful={() => {
                            console.log('Not helpful:', message.id);
                            setFeedbackMessageId(null);
                          }}
                          onClose={() => setFeedbackMessageId(null)}
                        />
                      </div>
                    )}

                    {/* Show feedback toggle for assistant messages */}
                    {!isUser && feedbackMessageId !== message.id && (
                      <button
                        onClick={() => setFeedbackMessageId(message.id)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
                      >
                        Feedback
                      </button>
                    )}
                  </Message>
                );
              })}

              {/* Thinking Bar when streaming */}
              {isStreaming && (
                <ThinkingBar
                  text="AI is thinking..."
                  onStop={() => {
                    // Handle stop thinking
                  }}
                />
              )}

              <ChatContainerScrollAnchor />
            </>
          )}
        </ChatContainerContent>
      </ChatContainerRoot>

      <div className="border-t border-border p-4 md:p-6 bg-background space-y-4">
        {/* Suggested prompts when no messages */}
        {messages.length === 0 && !isStreaming && (
          <div className="space-y-3 mb-4 max-w-4xl mx-auto">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Try asking</p>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              {SUGGESTED_PROMPTS.slice(0, 2).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className="text-left text-sm p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-accent/50 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto w-full">
          <PromptInput
            value={input}
            onValueChange={setInput}
            onSubmit={handleSend}
            isLoading={isStreaming}
            disabled={isStreaming}
            maxHeight={240}
          >
            <PromptInputTextarea
              placeholder="Ask a question about your documents..."
            />
            <PromptInputActions>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                size="sm"
                className="rounded-full bg-primary hover:bg-primary/90"
                title="Send message (Enter)"
              >
                <Send className="h-4 w-4" />
              </Button>
            </PromptInputActions>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
