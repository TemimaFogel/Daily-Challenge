import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  const hasHeading = title != null || description != null;
  return (
    <div
      className={cn(
        "flex flex-col gap-2 mb-6",
        actions && "sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {hasHeading && (
      <div>
        {title != null && (
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
        )}
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      )}
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
