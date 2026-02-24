import { useLocation, Link } from "react-router-dom";
import { Bell, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getPageTitle } from "@/lib/pageTitles";
import { UserBadge } from "@/components/user/UserBadge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser, getDisplayName } from "@/hooks/useCurrentUser";
import { useAuth } from "@/auth/AuthContext";

interface TopbarProps {
  /** Override title (e.g. from page); when not set, derived from route */
  title?: string;
  /** Right-side actions (optional, e.g. page-specific buttons) */
  actions?: React.ReactNode;
  /** When provided, show hamburger that opens the mobile sheet */
  onMenuClick?: () => void;
  className?: string;
}

export function Topbar({ title, actions, onMenuClick, className }: TopbarProps) {
  const location = useLocation();
  const pageTitle = title ?? getPageTitle(location.pathname);
  const { currentUser, logout } = useAuth();
  const { data: user, isLoading: userLoading } = useCurrentUser();

  const displayName = user
    ? getDisplayName(user.name, user.email)
    : "User";
  const profileImageUrl = user?.profileImageUrl;

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
        )}
        <h1 className="text-lg font-semibold text-foreground truncate">
          {pageTitle}
        </h1>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {actions != null && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-5" />
        </Button>
        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full outline-none hover:opacity-90"
                aria-label="User menu"
              >
                {userLoading ? (
                  <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm">
                    —
                  </div>
                ) : (
                  <UserBadge
                    name={displayName}
                    imageUrl={profileImageUrl}
                    size="md"
                    showLabel={true}
                  />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={logout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="inline-flex h-8 items-center justify-center rounded-sm px-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex h-8 items-center justify-center rounded-sm px-3 text-xs font-medium bg-primary text-primary-foreground shadow-sm hover:opacity-95"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
