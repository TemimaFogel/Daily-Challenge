import * as React from "react";
import { cn } from "@/lib/utils";

export interface SoftCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Use rounded-3xl for larger radius */
  largeRadius?: boolean;
}

export const SoftCard = React.forwardRef<HTMLDivElement, SoftCardProps>(
  ({ className, largeRadius, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl bg-white dark:bg-card shadow-md p-6",
        "transition-shadow duration-200 hover:shadow-soft-lg",
        largeRadius && "rounded-3xl",
        className
      )}
      {...props}
    />
  )
);
SoftCard.displayName = "SoftCard";
