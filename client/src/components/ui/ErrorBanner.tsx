import { cn } from "@/lib/utils";

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  /** When provided, shows a "Retry" button that calls this (e.g. refetch) */
  onRetry?: () => void;
  className?: string;
}

export function ErrorBanner({ message, onDismiss, onRetry, className }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-md border border-destructive/50 bg-destructive/10 text-destructive-foreground px-4 py-3 text-sm flex items-center justify-between gap-4",
        className
      )}
    >
      <span>{message}</span>
      <div className="flex items-center gap-2 shrink-0">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="font-medium underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="font-medium underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
