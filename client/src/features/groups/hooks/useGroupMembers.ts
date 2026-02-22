import { useQuery } from "@tanstack/react-query";
import { groupsApi } from "../api/groups.api";

export function useGroupMembers(groupId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["groups", groupId, "members"],
    queryFn: () => groupsApi.getMembers(groupId!),
    enabled: Boolean(groupId) && enabled,
  });
}
