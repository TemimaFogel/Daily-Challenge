import * as React from "react";
import { SectionHeader } from "./SectionHeader";
import { cn } from "@/lib/utils";

interface RightSidebarListProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function RightSidebarList({ title, children, className }: RightSidebarListProps) {
  return (
    <div className={cn("overflow-hidden rounded-2xl shadow-md", className)}>
      <SectionHeader title={title} variant="primary" />
      <div className="rounded-b-2xl bg-white dark:bg-card p-3">{children}</div>
    </div>
  );
}
