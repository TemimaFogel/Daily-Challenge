import { SectionHeader } from "./SectionHeader";
import { cn } from "@/lib/utils";

interface LeftSidebarCardProps {
  title: string;
  headerVariant?: "primary" | "secondary" | "default";
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function LeftSidebarCard({
  title,
  headerVariant = "primary",
  icon,
  children,
  className,
}: LeftSidebarCardProps) {
  return (
    <div className={cn("overflow-hidden rounded-2xl shadow-md", className)}>
      <SectionHeader title={title} variant={headerVariant} icon={icon} />
      <div className="rounded-b-2xl bg-white dark:bg-card p-4">{children}</div>
    </div>
  );
}
