import { useQuery } from "@tanstack/react-query";
import { groupsApi } from "../api/groups.api";

export function useGroupInvites(groupId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["groups", groupId, "invites"],
    queryFn: () => groupsApi.getInvites(groupId!),
    enabled: Boolean(groupId) && enabled,
  });
}
