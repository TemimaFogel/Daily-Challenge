import { useQuery } from "@tanstack/react-query";
import { getGroupDashboard } from "@/api/dashboard.api";

export function useGroupDashboard(groupId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["dashboard", "group", groupId],
    queryFn: () => getGroupDashboard(groupId!),
    enabled: Boolean(groupId) && enabled,
  });
}
