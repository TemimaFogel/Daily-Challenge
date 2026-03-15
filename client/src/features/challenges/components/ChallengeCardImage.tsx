import { resolveApiUrl } from "@/lib/urls";
import { cn } from "@/lib/utils";

interface ChallengeCardImageProps {
  imageUrl?: string | null;
  title?: string;
  className?: string;
  /** Default: object-cover. Use object-contain if needed. */
  objectFit?: "cover" | "contain";
}

/** Renders challenge card image or a placeholder when imageUrl is missing. */
export function ChallengeCardImage({
  imageUrl,
  title,
  className,
  objectFit = "cover",
}: ChallengeCardImageProps) {
  const src =
    typeof imageUrl === "string" && imageUrl.trim() !== ""
      ? resolveApiUrl(imageUrl)
      : null;

  if (src) {
    return (
      <img
        src={src}
        alt={title ? `Image for ${title}` : "Challenge"}
        className={cn("w-full h-full", objectFit === "cover" ? "object-cover" : "object-contain", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center bg-muted text-muted-foreground",
        className
      )}
      aria-hidden
    >
      <svg
        className="size-12 opacity-50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}
