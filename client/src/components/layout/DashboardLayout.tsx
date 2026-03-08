import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  leftSidebar: React.ReactNode;
  rightSidebar?: React.ReactNode;
  children: React.ReactNode;
  onMenuClick?: () => void;
  /** Extra class for main content */
  mainClassName?: string;
}

export function DashboardLayout({
  leftSidebar,
  rightSidebar,
  children,
  onMenuClick,
  mainClassName,
}: DashboardLayoutProps) {
  const [rightOpen, setRightOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[260px_1fr] lg:grid-cols-[260px_1fr_280px]">
        {/* Left Sidebar - hidden on mobile, shown via sheet when onMenuClick */}
        <aside className="hidden md:block md:shrink-0">{leftSidebar}</aside>

        {/* Main Content */}
        <main
          className={cn(
            "min-w-0 animate-fade-in",
            mainClassName
          )}
        >
          {children}
        </main>

        {/* Right Sidebar - hidden on tablet, shown on lg+ */}
        {rightSidebar && (
          <aside className="hidden shrink-0 lg:block">{rightSidebar}</aside>
        )}
      </div>
    </div>
  );
}
