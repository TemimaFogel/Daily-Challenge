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
