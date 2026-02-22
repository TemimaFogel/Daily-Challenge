import { useQuery } from "@tanstack/react-query";
import { groupsApi } from "../api/groups.api";

const MY_GROUPS_KEY = ["groups", "my"] as const;

export function useMyGroups() {
  return useQuery({
    queryKey: MY_GROUPS_KEY,
    queryFn: () => groupsApi.getMy(),
  });
}
