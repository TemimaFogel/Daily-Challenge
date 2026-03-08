import { useState } from "react";
import { cn } from "@/lib/utils";
import { resolveApiUrl } from "@/lib/urls";

function getInitials(name: string | null | undefined): string {
  if (name == null || name.trim() === "") return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0].charAt(0);
    const last = parts[parts.length - 1].charAt(0);
    return (first + last).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}

const sizeClasses = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-9 text-sm",
  lg: "size-12 text-base",
};

interface UserAvatarProps {
  name?: string | null;
  imageUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  online?: boolean;
  className?: string;
}

export function UserAvatar({
  name,
  imageUrl,
  size = "md",
  online,
  className,
}: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedSrc = !imageFailed ? resolveApiUrl(imageUrl) : null;
  const showImage = resolvedSrc != null && resolvedSrc !== "";

  return (
    <div className={cn("relative shrink-0", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-white dark:ring-card",
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
      {online && (
        <span
          className="absolute bottom-0 right-0 size-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-card"
          aria-hidden
        />
      )}
    </div>
  );
}
