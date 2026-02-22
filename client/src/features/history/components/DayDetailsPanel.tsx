import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Calendar, CheckCircle, ChevronRight, UserPlus, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DayEntry } from "../lib/historyMapper";

export interface DayDetailsPanelProps {
  selectedDate: string | null;
  entries: DayEntry[];
  joinedCount: number;
  completedCount: number;
  onClose?: () => void;
  className?: string;
  /** When true, render as inline panel (desktop). When false, content only for use inside Sheet. */
  variant?: "panel" | "content";
}

const visibilityLabels: Record<string, string> = {
  PERSONAL: "Personal",
  GROUP: "Group",
  PUBLIC: "Public",
};

export function DayDetailsPanel({
  selectedDate,
  entries,
  joinedCount,
  completedCount,
  onClose,
  className,
  variant = "panel",
}: DayDetailsPanelProps) {
  const navigate = useNavigate();

  if (!selectedDate) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center",
          variant === "panel" && "min-h-[280px]",
          className
        )}
      >
        <Calendar className="size-10 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Select a day to view activity</p>
      </div>
    );
  }

  const title = (() => {
    try {
      return format(parseISO(selectedDate), "EEEE, MMM d, yyyy");
    } catch {
      return selectedDate;
    }
  })();

  const content = (
    <>
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-base font-semibold text-foreground truncate">{title}</h3>
        {variant === "content" && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <XCircle className="size-5" />
          </button>
        )}
      </div>
      <div className="flex gap-3 mb-4 text-sm">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <UserPlus className="size-4" />
          <strong className="text-foreground">{joinedCount}</strong> Joined
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <CheckCircle className="size-4" />
          <strong className="text-foreground">{completedCount}</strong> Completed
        </span>
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No activity this day</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => {
            const hasId = Boolean(entry.challengeId?.trim());
            const handleClick = () => {
              if (!hasId) return;
              navigate(`/challenges/${entry.challengeId}`, {
                state: { from: "history", date: selectedDate },
              });
            };
            return (
              <li
                key={`${entry.date}-${entry.challengeId ?? "no-id"}`}
                role={hasId ? "button" : undefined}
                tabIndex={hasId ? 0 : undefined}
                onClick={hasId ? handleClick : undefined}
                onKeyDown={
                  hasId
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleClick();
                        }
                      }
                    : undefined
                }
                className={cn(
                  "rounded-lg border border-border bg-card p-3 shadow-sm flex items-start gap-3 transition-colors",
                  hasId &&
                    "cursor-pointer hover:bg-muted/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  !hasId && "opacity-75"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{entry.title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {visibilityLabels[entry.visibility] ?? entry.visibility}
                    </span>
                    {entry.joined && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                        <UserPlus className="size-3" /> Joined
                      </span>
                    )}
                    {entry.completed && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        <CheckCircle className="size-3" /> Completed
                      </span>
                    )}
                    {!entry.joined && !entry.completed && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                        —
                      </span>
                    )}
                  </div>
                  {entry.completed && entry.completedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(entry.completedAt), "h:mm a")}
                    </p>
                  )}
                </div>
                {hasId && (
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground mt-0.5" aria-hidden />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );

  if (variant === "content") {
    return <div className={cn("flex flex-col", className)}>{content}</div>;
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4 shadow-sm min-h-[200px]",
        className
      )}
    >
      {content}
    </div>
  );
}
