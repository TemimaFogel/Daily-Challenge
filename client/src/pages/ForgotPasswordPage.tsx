import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { forgotPassword } from "@/api/auth.api";

const MailIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function getErrorMessage(err: unknown): string {
    const ax = err as { response?: { data?: { message?: string } } };
    return ax.response?.data?.message ?? "Something went wrong. Please try again.";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      console.error("Forgot password error:", err);
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
              Forgot password?
            </h1>
            <CardDescription className="mt-2 text-primary-foreground/90">
              Enter your email and we&apos;ll send you a reset link
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="p-6 space-y-4">
            {success && (
              <p className="text-sm text-green-700 dark:text-green-400 bg-green-500/10 rounded-lg px-3 py-2">
                If an account with that email exists, a reset link has been sent.
              </p>
            )}
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {!success && (
              <>
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
                <Button
                  type="submit"
                  className="w-full gap-2 bg-primary-gradient text-primary-foreground hover:opacity-95"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Sending…" : "Send reset link"}
                  {!loading && <ArrowRightIcon />}
                </Button>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border p-4">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline underline-offset-4"
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
