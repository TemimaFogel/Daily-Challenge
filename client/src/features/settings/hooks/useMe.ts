import { useQuery } from "@tanstack/react-query";
import { authStore } from "@/auth/authStore";
import { getCurrentUser } from "@/api/user.api";

export function getMeQueryKey(userId: string) {
  return ["me", userId] as const;
}

export function useMe() {
  const userId = authStore.getCurrentUserId();
  const token = authStore.getToken();

  return useQuery({
    queryKey: getMeQueryKey(userId ?? ""),
    queryFn: getCurrentUser,
    enabled: !!token && !!userId,
    staleTime: 2 * 60 * 1000,
  });
}
