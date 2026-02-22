import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveApiUrl } from "@/lib/urls";

function getInitials(name: string | null | undefined): string {
  if (name == null || name.trim() === "") return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-9 text-sm",
};

interface UserBadgeProps {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md";
  className?: string;
  /** When true, show name + chevron (for Topbar). When false, avatar only. */
  showLabel?: boolean;
}

export function UserBadge({
  name,
  imageUrl,
  size = "md",
  className,
  showLabel = true,
}: UserBadgeProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedSrc = !imageFailed ? resolveApiUrl(imageUrl) : null;
  const showImage = resolvedSrc != null && resolvedSrc !== "";

  return (
    <div
      className={cn(
        "flex items-center gap-2 shrink-0",
        className
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-background",
          sizeClasses[size]
        )}
      >
        {showImage && resolvedSrc ? (
          <img
            src={resolvedSrc}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="select-none">{getInitials(name)}</span>
        )}
      </div>
      {showLabel && (
        <>
          <span className="font-medium text-foreground truncate max-w-[140px]">
            {name || "—"}
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </>
      )}
    </div>
  );
}
