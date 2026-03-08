import { DashboardNavbar } from "./DashboardNavbar";

const MAX_WIDTH = "max-w-5xl";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  headerActions?: React.ReactNode;
  /** When true, children is the full layout (e.g. DashboardLayout). No main wrapper. */
  fullWidth?: boolean;
}

export function AppLayout({ children, fullWidth }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background bg-main-gradient">
      <DashboardNavbar />
      {fullWidth ? (
        <div className="flex-1">{children}</div>
      ) : (
        <main className={`flex-1 w-full mx-auto px-4 py-6 ${MAX_WIDTH}`}>
          {children}
        </main>
      )}
    </div>
  );
}
