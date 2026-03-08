import { useQuery } from "@tanstack/react-query";
import { groupsApi } from "../api/groups.api";

export function getGroupChallengesQueryKey(groupId: string | undefined) {
  return ["groups", groupId, "challenges"] as const;
}

export function useGroupChallenges(groupId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: getGroupChallengesQueryKey(groupId),
    queryFn: () => groupsApi.getChallenges(groupId!),
    enabled: Boolean(groupId) && enabled,
  });
}
