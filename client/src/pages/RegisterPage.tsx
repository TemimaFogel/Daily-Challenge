import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { register } from "@/api/auth.api";
import { authStore } from "@/auth/authStore";

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
const UserIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const GlobeIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0h.5a2.5 2.5 0 002.5-2.5V3.935M12 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const timezone = useMemo(
    () => (typeof Intl !== "undefined" && Intl.DateTimeFormat
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC"),
    []
  );

  function getErrorMessage(err: unknown): string {
    const ax = err as { response?: { status?: number; data?: { message?: string } } };
    if (ax.response?.status === 409) return "Email already exists.";
    if (ax.response?.status === 400) {
      return ax.response?.data?.message ?? "Invalid input. Please check the form.";
    }
    return ax.response?.data?.message ?? "Registration failed. Please try again.";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const data = await register(email, password, name, timezone);
      const token = data?.token ?? data?.accessToken;
      if (token) {
        authStore.setToken(token);
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/login", { state: { message: "Account created, please sign in." }, replace: true });
      }
    } catch (err: unknown) {
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
              Create an account
            </h1>
            <CardDescription className="mt-2 text-primary-foreground/90">
              Register with your email and password
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="p-6 space-y-4">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <label htmlFor="register-name" className="text-sm font-medium text-foreground">
                Name
              </label>
              <Input
                id="register-name"
                type="text"
                placeholder="Your name"
                leftIcon={<UserIcon />}
                className="w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="register-email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="register-email"
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
              <label htmlFor="register-password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                id="register-password"
                type="password"
                placeholder="••••••••"
                leftIcon={<LockIcon />}
                className="w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="register-confirm-password" className="text-sm font-medium text-foreground">
                Confirm Password
              </label>
              <Input
                id="register-confirm-password"
                type="password"
                placeholder="••••••••"
                leftIcon={<LockIcon />}
                className="w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="register-timezone" className="text-sm font-medium text-foreground">
                Timezone
              </label>
              <Input
                id="register-timezone"
                type="text"
                placeholder="e.g. America/New_York"
                leftIcon={<GlobeIcon />}
                className="w-full bg-muted/50"
                value={timezone}
                readOnly
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full gap-2 bg-primary-gradient text-primary-foreground hover:opacity-95"
              size="lg"
              disabled={loading}
            >
              {loading ? "Creating account…" : "Create account"}
              {!loading && <ArrowRightIcon />}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border p-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className={cn(
                  "font-medium text-primary hover:underline underline-offset-4"
                )}
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
