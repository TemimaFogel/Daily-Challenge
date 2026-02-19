import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function CardSection({
  title,
  description,
  children,
  className,
}: CardSectionProps) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card shadow-card-soft p-4", className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
