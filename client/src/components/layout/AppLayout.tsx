import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

const SIDEBAR_WIDTH = "260px";
const MAX_WIDTH = "max-w-5xl";

interface AppLayoutProps {
  children: ReactNode;
  /** Page title shown in the top header bar */
  title?: string;
  /** User controls (e.g. account menu) rendered in the top header bar */
  headerActions?: ReactNode;
}

export function AppLayout({ children, title, headerActions }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div
        className="flex flex-1 flex-col min-w-0"
        style={{ marginLeft: SIDEBAR_WIDTH }}
      >
        <Header title={title} actions={headerActions} />
        <main className={`flex-1 w-full mx-auto px-4 py-6 ${MAX_WIDTH} bg-main-gradient`}>
          {children}
        </main>
      </div>
    </div>
  );
}
