import { UserAvatar } from "./UserAvatar";
import { cn } from "@/lib/utils";

interface FriendSuggestionItemProps {
  name: string;
  imageUrl?: string | null;
  onAdd?: () => void;
  badge?: string | number;
  className?: string;
}

export function FriendSuggestionItem(props: FriendSuggestionItemProps) {
  const { name, imageUrl, onAdd, badge, className } = props;
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/50",
        className
      )}
    >
      <UserAvatar name={name} imageUrl={imageUrl} size="sm" />
      <span className="flex-1 truncate text-sm font-medium text-foreground">{name}</span>
      {badge != null && (
        <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-xs font-medium text-primary">
          {badge}
        </span>
      )}
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95"
          aria-label={`Add ${name} as friend`}
        >
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </div>
  );
}
