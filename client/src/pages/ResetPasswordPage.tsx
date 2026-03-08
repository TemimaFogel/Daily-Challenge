import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { resetPassword } from "@/api/auth.api";

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

const MIN_PASSWORD_LENGTH = 6;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [missingToken, setMissingToken] = useState(false);

  useEffect(() => {
    if (!token.trim()) {
      setMissingToken(true);
    }
  }, [token]);

  function getErrorMessage(err: unknown): string {
    const ax = err as { response?: { status?: number; data?: { message?: string } } };
    if (ax.response?.status === 400) {
      return ax.response?.data?.message ?? "Invalid or expired reset link. Request a new one.";
    }
    return ax.response?.data?.message ?? "Something went wrong. Please try again.";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      navigate("/login", { replace: true, state: { message: "Password successfully reset." } });
    } catch (err: unknown) {
      console.error("Reset password error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (missingToken) {
    return (
      <div className="min-h-screen bg-main-gradient flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-2xl shadow-card-soft border border-border overflow-hidden">
          <CardHeader className="p-0">
            <div className="bg-primary-gradient px-6 py-8 text-center">
              <h1 className="text-2xl font-semibold text-primary-foreground">
                Invalid reset link
              </h1>
              <CardDescription className="mt-2 text-primary-foreground/90">
                This link is missing a token. Use the link from your email or request a new one.
              </CardDescription>
            </div>
          </CardHeader>
          <CardFooter className="flex justify-center border-t border-border p-4">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary hover:underline underline-offset-4"
            >
              Request a new reset link
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-gradient flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-card-soft border border-border overflow-hidden">
        <CardHeader className="p-0">
          <div className="bg-primary-gradient px-6 py-8 text-center">
            <h1 className="text-2xl font-semibold text-primary-foreground">
              Reset password
            </h1>
            <CardDescription className="mt-2 text-primary-foreground/90">
              Enter your new password below
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
              <label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                New password
              </label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                leftIcon={<LockIcon />}
                className="w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={MIN_PASSWORD_LENGTH}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                leftIcon={<LockIcon />}
                className="w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={MIN_PASSWORD_LENGTH}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full gap-2 bg-primary-gradient text-primary-foreground hover:opacity-95"
              size="lg"
              disabled={loading}
            >
              {loading ? "Updating…" : "Reset password"}
              {!loading && <ArrowRightIcon />}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border p-4">
            <p className="text-sm text-muted-foreground">
              <Link
                to="/login"
                className="font-medium text-primary hover:underline underline-offset-4"
              >
                Back to sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
