import { Navigate, Outlet } from "react-router-dom";
import { authStore } from "@/auth/authStore";

export function RequireAuth() {
  if (!authStore.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
