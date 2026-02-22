import { cn } from "@/lib/utils";

export interface AvatarStackItem {
  name: string;
  imageUrl?: string | null;
}

interface AvatarStackProps {
  items: AvatarStackItem[];
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

const sizeClasses = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
};

export function AvatarStack({
  items,
  max = 5,
  size = "md",
  className,
}: AvatarStackProps) {
  const visible = items.slice(0, max);
  const overflow = items.length > max ? items.length - max : 0;
  const base =
    "inline-flex shrink-0 items-center justify-center rounded-full border-2 border-background bg-muted font-medium text-muted-foreground overflow-hidden";

  return (
    <div
      className={cn("flex -space-x-2", className)}
      aria-label={items.map((i) => i.name).join(", ")}
    >
      {visible.map((item, i) => (
        <div
          key={i}
          className={cn(
            base,
            sizeClasses[size],
            "ring-2 ring-background"
          )}
          title={item.name}
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="select-none">
              {item.name ? item.name.charAt(0).toUpperCase() : "?"}
            </span>
          )}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            base,
            sizeClasses[size],
            "ring-2 ring-background"
          )}
          title={`+${overflow} more`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
