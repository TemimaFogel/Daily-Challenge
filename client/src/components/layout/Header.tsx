import { ReactNode } from "react";
import { cn } from "@/lib/utils";

const HEADER_HEIGHT = "h-14";

const iconButton =
  "rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors";

const BellIcon = () => (
  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);
const HelpIcon = () => (
  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface HeaderProps {
  title?: string;
  actions?: ReactNode;
  className?: string;
}

export function Header({ title, actions, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-border bg-white/80 px-4 backdrop-blur-sm",
        HEADER_HEIGHT,
        className
      )}
    >
      <h1 className="text-lg font-semibold text-foreground truncate">
        {title ?? ""}
      </h1>
      <div className="flex items-center gap-1 shrink-0">
        <button type="button" className={iconButton} aria-label="Notifications">
          <BellIcon />
        </button>
        <button type="button" className={iconButton} aria-label="Help">
          <HelpIcon />
        </button>
        {actions ?? (
          <div
            className="ml-2 flex size-8 items-center justify-center rounded-full bg-primary-gradient text-sm font-medium text-primary-foreground"
            aria-hidden
          >
            U
          </div>
        )}
      </div>
    </header>
  );
}
