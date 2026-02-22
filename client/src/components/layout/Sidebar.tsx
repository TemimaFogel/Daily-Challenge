import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/auth/AuthContext";
import {
  SIDEBAR_NAV_ITEMS,
  NAV_SIGN_IN,
  NAV_SIGN_UP,
  NAV_LOGOUT,
} from "./navConfig";

const SIDEBAR_WIDTH = "w-[260px]";

const navLinkBase =
  "flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium transition-colors";
const navLinkInactive =
  "text-muted-foreground hover:bg-muted/80 hover:text-foreground";
const navLinkActive =
  "bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-foreground shadow-sm";

interface SidebarProps {
  className?: string;
  /** When true, used inside mobile sheet (no fixed positioning) */
  inline?: boolean;
}

export function Sidebar({ className, inline }: SidebarProps) {
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const isDashboardActive = location.pathname === "/" || location.pathname === "/dashboard";

  const content = (
    <>
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">
          DC
        </div>
        <span className="font-semibold text-foreground">Daily Challenge</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {SIDEBAR_NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = to === "/dashboard" ? isDashboardActive : undefined;
          return (
            <NavLink
              key={to}
              to={to}
              end={to !== "/challenges"}
              className={({ isActive }) =>
                cn(
                  navLinkBase,
                  (active ?? isActive) ? navLinkActive : navLinkInactive
                )
              }
            >
              <Icon className="size-5 shrink-0" />
              {label}
            </NavLink>
          );
        })}
      </nav>
      <div className="shrink-0 p-4">
        <Separator className="mb-4" />
        {currentUser ? (
          <Button
            variant="ghost"
            className={cn(navLinkBase, "w-full justify-start text-muted-foreground hover:bg-muted/80 hover:text-foreground")}
            onClick={logout}
          >
            <NAV_LOGOUT.icon className="size-5 shrink-0" />
            {NAV_LOGOUT.label}
          </Button>
        ) : (
          <div className="flex flex-col gap-1">
            <NavLink
              to={NAV_SIGN_IN.to}
              className={({ isActive }) =>
                cn(
                  navLinkBase,
                  isActive ? navLinkActive : navLinkInactive
                )
              }
            >
              <NAV_SIGN_IN.icon className="size-5 shrink-0" />
              {NAV_SIGN_IN.label}
            </NavLink>
            <NavLink
              to={NAV_SIGN_UP.to}
              className={({ isActive }) =>
                cn(
                  navLinkBase,
                  isActive ? navLinkActive : navLinkInactive
                )
              }
            >
              <NAV_SIGN_UP.icon className="size-5 shrink-0" />
              {NAV_SIGN_UP.label}
            </NavLink>
          </div>
        )}
      </div>
    </>
  );

  if (inline) {
    return (
      <div className={cn("flex h-full flex-col", SIDEBAR_WIDTH, className)}>
        {content}
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar hidden md:flex flex-col",
        SIDEBAR_WIDTH,
        className
      )}
    >
      {content}
    </aside>
  );
}
