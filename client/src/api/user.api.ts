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

export interface UpdateUserRequest {
  name?: string | null;
  timezone?: string | null;
}

/** PATCH /api/users/me - update current user (name, timezone) */
export async function updateCurrentUser(body: UpdateUserRequest): Promise<CurrentUser> {
  const { data } = await http.patch<CurrentUser>("/api/users/me", body);
  return data ?? { id: "" };
}

export interface ProfileImageResponse {
  profileImageUrl?: string | null;
}

/** POST /api/users/me/profile-image - multipart upload */
export async function uploadProfileImage(file: File): Promise<ProfileImageResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await http.post<ProfileImageResponse>("/api/users/me/profile-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data ?? {};
}
