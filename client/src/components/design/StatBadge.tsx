import { cn } from "@/lib/utils";

type StatBadgeVariant = "success" | "streak" | "info" | "notification" | "muted";

const variantClasses: Record<StatBadgeVariant, string> = {
  success: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  streak: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-400",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  notification: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  muted: "bg-muted text-muted-foreground",
};

interface StatBadgeProps {
  icon?: React.ReactNode;
  label: string | number;
  variant?: StatBadgeVariant;
  className?: string;
}

export function StatBadge({
  icon,
  label,
  variant = "muted",
  className,
}: StatBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {icon && <span className="[&_svg]:size-3.5 shrink-0">{icon}</span>}
      {label}
    </span>
  );
}
