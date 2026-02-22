import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Mail,
  CalendarDays,
  Settings,
  LogIn,
  UserPlus,
  LogOut,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

/** Main sidebar menu items in display order */
export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/challenges", label: "Challenges", icon: Trophy },
  { to: "/groups", label: "Groups", icon: Users },
  { to: "/invitations", label: "Invitations", icon: Mail },
  { to: "/history", label: "History", icon: CalendarDays },
  { to: "/settings", label: "Settings", icon: Settings },
];

/** Auth: sign-in (when not logged in) */
export const NAV_SIGN_IN: NavItem = { to: "/login", label: "Sign-in", icon: LogIn };

/** Auth: sign-up (when not logged in) */
export const NAV_SIGN_UP: NavItem = { to: "/register", label: "Sign-up", icon: UserPlus };

/** Auth: logout (when logged in) - to is unused; use button + handler */
export const NAV_LOGOUT: NavItem = { to: "#", label: "Logout", icon: LogOut };
