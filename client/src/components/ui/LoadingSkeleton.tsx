import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      aria-hidden
    />
  );
}

/** Preset: card-like block (title + 3 lines) */
export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card space-y-4">
      <LoadingSkeleton className="h-5 w-1/3" />
      <LoadingSkeleton className="h-4 w-full" />
      <LoadingSkeleton className="h-4 w-full" />
      <LoadingSkeleton className="h-4 w-2/3" />
    </div>
  );
}

/** Preset: list row */
export function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-2">
      <LoadingSkeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <LoadingSkeleton className="h-4 w-1/4" />
        <LoadingSkeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
