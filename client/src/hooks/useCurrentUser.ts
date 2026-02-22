import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/api/user.api";
import { authStore } from "@/auth/authStore";

export function useCurrentUser() {
  const isAuthenticated = authStore.isAuthenticated();
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

/** Display name: name if present, else email prefix before @ */
export function getDisplayName(
  name: string | null | undefined,
  email: string | null | undefined
): string {
  if (name != null && String(name).trim() !== "") return String(name).trim();
  if (email != null && String(email).trim() !== "") {
    const part = String(email).trim().split("@")[0];
    if (part) return part;
  }
  return "User";
}
