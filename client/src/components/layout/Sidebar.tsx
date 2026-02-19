import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = "w-[260px]";

const navLink =
  "flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-active hover:text-accent-foreground";
const navLinkActive = "bg-sidebar-active text-accent-foreground";

const icons = {
  dashboard: (
    <svg className="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  layout: (
    <svg className="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
};

const items = [
  { to: "/", label: "Dashboard", icon: icons.dashboard },
  { to: "/demo", label: "Design demo", icon: icons.layout },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar",
        SIDEBAR_WIDTH
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
          <Link to="/" className="font-semibold text-foreground">
            Daily Challenge
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {items.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                navLink,
                location.pathname === to && navLinkActive
              )}
            >
              {icon}
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
