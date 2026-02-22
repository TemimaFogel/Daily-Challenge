import { useQuery } from "@tanstack/react-query";
import { authStore } from "@/auth/authStore";
import { groupsApi } from "../api/groups.api";

const MY_GROUPS_KEY = ["groups", "my"] as const;

export function getMyGroupsQueryKey() {
  const userId = authStore.getCurrentUserId();
  return [...MY_GROUPS_KEY, userId ?? ""] as const;
}

export function useMyGroups() {
  const token = authStore.getToken();
  const userId = authStore.getCurrentUserId();
  return useQuery({
    queryKey: getMyGroupsQueryKey(),
    queryFn: () => groupsApi.getMy(),
    enabled: !!token && !!userId,
  });
}
