import { http } from "@/api/http";

export interface CurrentUser {
  id: string;
  email?: string | null;
  name?: string | null;
  timezone?: string | null;
  profileImageUrl?: string | null;
}

/** GET /api/users/me - current user profile (requires auth) */
export async function getCurrentUser(): Promise<CurrentUser> {
  const { data } = await http.get<CurrentUser>("/api/users/me");
  return data ?? { id: "" };
}
