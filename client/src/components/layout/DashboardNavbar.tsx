import { Link, NavLink, useLocation } from "react-router-dom";
import { Home, Trophy, Users, Mail, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/design/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser, getDisplayName } from "@/hooks/useCurrentUser";
import { useAuth } from "@/auth/AuthContext";
import { NotificationsBell } from "./NotificationsBell";

const CENTER_NAV = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/challenges", label: "Challenges", icon: Trophy, end: false },
  { to: "/groups", label: "Groups", icon: Users, end: false },
  { to: "/invitations", label: "Invitations", icon: Mail, end: false },
  { to: "/history", label: "History", icon: CalendarDays, end: false },
];

export function DashboardNavbar() {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { data: user } = useCurrentUser();
  const displayName = user ? getDisplayName(user.name, user.email) : "User";
  const profileImageUrl = user?.profileImageUrl;

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-white/95 px-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-card/95">
      <Link to="/" className="flex shrink-0 items-center gap-2">
        <img
          src="/logo.png"
          alt="Daily Challenge"
          className="h-30 max-w-[300px] object-contain object-left"
        />
      </Link>

      <nav className="flex shrink-0 items-center gap-2">
        {CENTER_NAV.map(({ to, label, icon: Icon, end }) => {
          const isActive = end
            ? location.pathname === "/" || location.pathname === "/dashboard"
            : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-2 transition-colors hover:bg-muted min-w-[56px]",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={label}
            >
              <Icon className="size-5 shrink-0" />
              <span className="text-[10px] font-medium leading-tight">{label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <div className="relative hidden sm:block">
          <input
            type="search"
            placeholder="Search..."
            className="h-9 w-40 rounded-full border border-border bg-muted/50 pl-4 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <svg
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <NotificationsBell />
        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="rounded-full outline-none ring-0 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <UserAvatar
                  name={displayName}
                  imageUrl={profileImageUrl}
                  size="sm"
                  className="ring-2 ring-transparent transition-opacity hover:opacity-90"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex gap-2">
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-95"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
