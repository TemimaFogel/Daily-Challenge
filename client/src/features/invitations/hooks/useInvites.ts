import { useQuery } from "@tanstack/react-query";
import { authStore } from "@/auth/authStore";
import { invitationsApi } from "../api/invitations.api";

export const INVITES_QUERY_KEY = ["invites"] as const;

export function getInvitesQueryKey() {
  const userId = authStore.getCurrentUserId();
  return [...INVITES_QUERY_KEY, userId ?? ""] as const;
}

export function useInvites() {
  const token = authStore.getToken();
  const userId = authStore.getCurrentUserId();
  return useQuery({
    queryKey: getInvitesQueryKey(),
    queryFn: () => invitationsApi.getList(),
    enabled: !!token && !!userId,
  });
}
