import { cn } from '@/lib/utils';

interface TextShimmerProps {
  children: React.ReactNode;
  duration?: number;
  spread?: number;
  className?: string;
}

export function TextShimmer({
  children,
  duration = 4,
  spread = 20,
  className
}: TextShimmerProps) {
  return (
    <span
      className={cn(
        'relative inline-block',
        className
      )}
      style={{
        '--shimmer-duration': `${duration}s`,
        '--shimmer-spread': `${spread}px`,
      } as React.CSSProperties & {
        '--shimmer-duration': string;
        '--shimmer-spread': string;
      }}
    >
      <style>{`
        @keyframes shimmer-${duration}-${spread} {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        
        .shimmer-text-${duration}-${spread} {
          background: linear-gradient(
            90deg,
            currentColor 0%,
            currentColor calc(50% - var(--shimmer-spread)),
            rgba(255, 255, 255, 0.3) 50%,
            currentColor calc(50% + var(--shimmer-spread)),
            currentColor 100%
          );
          background-size: 1000px 100%;
          animation: shimmer-${duration}-${spread} ${duration}s infinite;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
      <span className={`shimmer-text-${duration}-${spread}`}>
        {children}
      </span>
    </span>
  );
}

interface ThinkingBarProps {
  text?: string;
  stopLabel?: string;
  onStop?: () => void;
  className?: string;
}

export function ThinkingBar({
  text = 'Thinking',
  stopLabel = 'Answer now',
  onStop,
  className
}: ThinkingBarProps) {
  return (
    <div className={cn(
      'flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50',
      className
    )}>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-sm text-muted-foreground">{text}</span>
      </div>
      {onStop && (
        <button
          onClick={onStop}
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {stopLabel}
        </button>
      )}
    </div>
  );
}

interface FeedbackBarProps {
  title?: string;
  onHelpful?: () => void;
  onNotHelpful?: () => void;
  onClose?: () => void;
  className?: string;
}

export function FeedbackBar({
  title = 'Was this response helpful?',
  onHelpful,
  onNotHelpful,
  onClose,
  className
}: FeedbackBarProps) {
  return (
    <div className={cn(
      'flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50',
      className
    )}>
      <span className="text-sm text-foreground">{title}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={onHelpful}
          className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-background transition-colors"
          title="Helpful"
        >
          <svg className="h-4 w-4 text-muted-foreground hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.646 7.23a2 2 0 01-1.789 1.106H7a2 2 0 01-2-2V7a2 2 0 012-2h.5a2 2 0 01.667.125A6.97 6.97 0 0110 3a7 7 0 110 14z" />
          </svg>
        </button>
        <button
          onClick={onNotHelpful}
          className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-background transition-colors"
          title="Not helpful"
        >
          <svg className="h-4 w-4 text-muted-foreground hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.646-7.23a2 2 0 011.789-1.106H17a2 2 0 012 2v7a2 2 0 01-2 2h-.5a2 2 0 01-.667-.125A6.97 6.97 0 0114 21a7 7 0 11-4-6.414z" />
          </svg>
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-background transition-colors ml-1"
            title="Close"
          >
            <svg className="h-4 w-4 text-muted-foreground hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
