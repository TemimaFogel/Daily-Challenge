import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { login } from "@/api/auth.api";
import { useAuth } from "@/auth/AuthContext";

const MailIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const LockIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { login: authLogin } = useAuth();
  const successMessage = (location.state as { message?: string } | null)?.message;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function getErrorMessage(err: unknown): string {
    const ax = err as { response?: { status?: number; data?: { message?: string } } };
    if (ax.response?.status === 401) {
      return ax.response?.data?.message ?? "Invalid email or password.";
    }
    return ax.response?.data?.message ?? "Sign in failed. Please try again.";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await login(email, password);
      if (user?.id != null) {
        authLogin(token, { id: String(user.id), email: user.email });
      } else {
        authLogin(token, { id: "", email: undefined });
      }
      queryClient.invalidateQueries({ queryKey: ["invites"] });
      queryClient.invalidateQueries({ queryKey: ["groups", "my"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      navigate("/", { replace: true });
    } catch (err: unknown) {
      console.error("Login error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-main-gradient flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-card-soft border border-border overflow-hidden">
        <CardHeader className="p-0">
          <div className="bg-primary-gradient px-6 py-8 text-center">
            <h1 className="text-2xl font-semibold text-primary-foreground">
              Welcome Back!
            </h1>
            <CardDescription className="mt-2 text-primary-foreground/90">
              Sign in to your account to continue
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="p-6 space-y-4">
            {successMessage && (
              <p className="text-sm text-green-700 dark:text-green-400 bg-green-500/10 rounded-lg px-3 py-2">
                {successMessage}
              </p>
            )}
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                leftIcon={<MailIcon />}
                className="w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                leftIcon={<LockIcon />}
                className="w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full gap-2 bg-primary-gradient text-primary-foreground hover:opacity-95"
              size="lg"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign In"}
              {!loading && <ArrowRightIcon />}
            </Button>
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              type="button"
              disabled
              title="Coming soon"
            >
              Google
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              type="button"
              disabled
              title="Coming soon"
            >
              GitHub
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Google and GitHub sign-in coming soon.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border p-4">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className={cn(
                "font-medium text-primary hover:underline underline-offset-4"
              )}
            >
              Register
            </Link>
          </p>
        </CardFooter>
        </form>
      </Card>
    </div>
  );
}
