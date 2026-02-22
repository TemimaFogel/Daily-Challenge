import { useQuery } from "@tanstack/react-query";
import { authStore } from "@/auth/authStore";
import { getHistory } from "../api/history.api";
import { buildHistoryMonthData, monthRange, type HistoryMonthData } from "../lib/historyMapper";
import { format } from "date-fns";

export function getHistoryQueryKey(userId: string, yearMonth: string) {
  return ["history", userId, yearMonth] as const;
}

export function useHistoryMonth(monthDate: Date) {
  const userId = authStore.getCurrentUserId();
  const token = authStore.getToken();
  const { from, to } = monthRange(monthDate);
  const yearMonth = format(monthDate, "yyyy-MM");

  const query = useQuery({
    queryKey: getHistoryQueryKey(userId ?? "", yearMonth),
    queryFn: async () => {
      const res = await getHistory(from, to);
      return buildHistoryMonthData(res.entries, res.dailySummaries);
    },
    enabled: !!token && !!userId && !!from && !!to,
  });

  return {
    ...query,
    data: query.data as HistoryMonthData | undefined,
  };
}
