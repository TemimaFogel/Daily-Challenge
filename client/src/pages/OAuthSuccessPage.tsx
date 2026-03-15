import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/auth/AuthContext";
import { authStore } from "@/auth/authStore";
import { getCurrentUser } from "@/api/user.api";

/**
 * Handles the OAuth success redirect (e.g. from Google sign-in).
 * Reads token from URL, stores it, loads current user, then redirects into the app.
 * Uses the same auth storage and post-login flow as email/password login.
 */
export function OAuthSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token || token.trim() === "") {
      setError("Missing token. Please try signing in again.");
      return;
    }

    let cancelled = false;
    authStore.setToken(token);
    getCurrentUser()
      .then((user) => {
        if (cancelled) return;
        if (user?.id) {
          authLogin(token, {
            id: String(user.id),
            email: user.email ?? undefined,
            name: user.name ?? undefined,
          });
        } else {
          authLogin(token, { id: "", email: undefined });
        }
        queryClient.invalidateQueries({ queryKey: ["invites"] });
        queryClient.invalidateQueries({ queryKey: ["groups", "my"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        navigate("/", { replace: true });
      })
      .catch(() => {
        if (!cancelled) {
          authStore.clearToken();
          setError("Could not complete sign in. Please try again.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, authLogin, navigate, queryClient]);

  if (error) {
    return (
      <div className="min-h-screen bg-main-gradient flex flex-col items-center justify-center p-4">
        <div className="rounded-2xl border border-border bg-card p-6 max-w-md text-center">
          <p className="text-destructive font-medium">{error}</p>
          <Link
            to="/login"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-gradient flex flex-col items-center justify-center p-4">
      <div className="rounded-2xl border border-border bg-card px-8 py-6">
        <p className="text-muted-foreground">Completing sign in…</p>
        <div className="mt-4 h-2 w-32 rounded-full bg-muted overflow-hidden">
          <div className="h-full w-1/2 animate-pulse bg-primary/50 rounded-full" />
        </div>
      </div>
    </div>
  );
}
