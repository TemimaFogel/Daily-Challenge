import { resolveApiUrl } from "@/lib/urls";
import { cn } from "@/lib/utils";

export interface ParticipantPreviewUser {
  name?: string | null;
  profileImageUrl?: string | null;
}

interface ChallengeParticipantsPreviewProps {
  count?: number;
  usersPreview?: ParticipantPreviewUser[];
  size?: "sm" | "md";
  className?: string;
}

const sizeClasses = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
};

function getInitials(name: string | null | undefined): string {
  if (name == null || String(name).trim() === "") return "?";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return String(name).charAt(0).toUpperCase();
}

export function ChallengeParticipantsPreview({
  count,
  usersPreview,
  size = "sm",
  className,
}: ChallengeParticipantsPreviewProps) {
  if (count == null || count <= 0) return null;

  const base =
    "inline-flex shrink-0 items-center justify-center rounded-full border-2 border-background bg-muted font-medium text-muted-foreground overflow-hidden ring-2 ring-background";

  if (usersPreview != null && usersPreview.length > 0) {
    const visible = usersPreview.slice(0, 3);
    const overflow = count > 3 ? count - 3 : 0;
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex -space-x-2">
          {visible.map((user, i) => {
            const src = resolveApiUrl(user.profileImageUrl);
            return (
              <div
                key={i}
                className={cn(base, sizeClasses[size])}
                title={user.name ?? undefined}
              >
                {src ? (
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="select-none">
                    {getInitials(user.name)}
                  </span>
                )}
              </div>
            );
          })}
          {overflow > 0 && (
            <div
              className={cn(base, sizeClasses[size])}
              title={`+${overflow} more`}
            >
              +{overflow}
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {count} participant{count !== 1 ? "s" : ""}
        </span>
      </div>
    );
  }

  return (
    <span className={cn("text-xs text-muted-foreground", className)}>
      {count} participant{count !== 1 ? "s" : ""}
    </span>
  );
}
