import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authStore } from "@/auth/authStore";

export function RequireAuth() {
  const location = useLocation();
  if (!authStore.isAuthenticated()) {
    const redirect = location.pathname + location.search;
    const loginPath =
      redirect && redirect !== "/login"
        ? `/login?redirect=${encodeURIComponent(redirect)}`
        : "/login";
    return <Navigate to={loginPath} replace />;
  }
  return <Outlet />;
}
