import { http } from "@/api/http";

export interface LoginResponse {
  token: string;
  user?: { id: string; email?: string; [key: string]: unknown };
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const { data } = await http.post<{ token?: string; accessToken?: string; user?: LoginResponse["user"] }>(
    "/api/auth/login",
    { email, password }
  );
  const token = data?.token ?? data?.accessToken;
  if (!token) {
    throw new Error("Invalid response from server.");
  }
  return { token, user: data?.user };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  timezone: string;
}

export interface RegisterResponse {
  token?: string;
  accessToken?: string;
  user?: { id: string; email?: string; name?: string; [key: string]: unknown };
}

export async function register(
  email: string,
  password: string,
  name: string,
  timezone: string
): Promise<RegisterResponse> {
  const { data } = await http.post<RegisterResponse>("/api/auth/register", {
    email,
    password,
    name,
    timezone,
  });
  return data ?? {};
}

/**
 * URL to start the backend Google OAuth flow.
 * Redirect the browser here to begin "Continue with Google".
 * Returns empty string if VITE_API_BASE_URL is not set.
 */
export function getGoogleOAuthStartUrl(): string {
  const base = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
  return base ? `${base}/oauth2/authorization/google` : "";
}

/** POST /api/auth/forgot-password - always returns 200 (do not reveal if email exists). */
export async function forgotPassword(email: string): Promise<void> {
  await http.post("/api/auth/forgot-password", { email: email.trim() });
}

/** POST /api/auth/reset-password - returns 200 on success, 400 if token invalid/expired. */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await http.post("/api/auth/reset-password", { token: token.trim(), newPassword: newPassword.trim() });
}
