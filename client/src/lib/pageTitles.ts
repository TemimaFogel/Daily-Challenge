/** Map route path (or pathname) to page title for Topbar */
export const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/challenges": "Challenges",
  "/challenges/new": "New Challenge",
  "/groups": "Groups",
  "/invitations": "Invitations",
  "/history": "History",
  "/settings": "Settings",
  "/login": "Sign in",
  "/register": "Sign up",
};

/**
 * Get page title from pathname. Uses exact match first, then prefix match for dynamic segments (e.g. /challenges/:id).
 */
export function getPageTitle(pathname: string): string {
  const normalized = pathname.replace(/\/$/, "") || "/";
  if (PAGE_TITLES[normalized]) return PAGE_TITLES[normalized];
  if (normalized.startsWith("/challenges/") && normalized !== "/challenges/new") {
    return "Challenge";
  }
  return "Daily Challenge";
}
