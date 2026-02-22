import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const SIDEBAR_WIDTH = "260px";
const MAX_WIDTH = "max-w-5xl";

interface AppLayoutProps {
  children: React.ReactNode;
  /** Override page title in Topbar (default: from route via pageTitles) */
  title?: string;
  /** Optional actions in Topbar right side (before bell/avatar) */
  headerActions?: React.ReactNode;
}

export function AppLayout({ children, title, headerActions }: AppLayoutProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSheetOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left">
          <Sidebar inline />
        </SheetContent>
      </Sheet>
      <div
        className="flex flex-1 flex-col min-w-0 md:ml-[260px]"
      >
        <Topbar
          title={title}
          actions={headerActions}
          onMenuClick={() => setSheetOpen(true)}
        />
        <main
          className={`flex-1 w-full mx-auto px-4 py-6 ${MAX_WIDTH} bg-main-gradient`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
