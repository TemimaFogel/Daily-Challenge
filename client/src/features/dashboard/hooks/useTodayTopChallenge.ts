import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { useChallengesList } from "@/features/challenges/hooks/useChallenges";
import { challengesApi } from "@/features/challenges/api/challenges.api";
import type { Challenge } from "@/features/challenges/types";

/**
 * Returns today's challenge visible to the current user with the highest
 * participant count. Uses GET /api/challenges?date=today (visibility rules
 * applied) and GET /api/challenges/:id/stats for each to pick the top one.
 */
export function useTodayTopChallenge(todayLocal: string) {
  const { data: challenges = [], isLoading: listLoading } = useChallengesList({
    date: todayLocal,
  });

  const statsQueries = useQueries({
    queries: challenges.map((c) => ({
      queryKey: ["challenges", "stats", c.id],
      queryFn: () => challengesApi.getStats(c.id),
      enabled: !!c.id,
    })),
  });

  const statsLoading = statsQueries.some((q) => q.isLoading);
  const isLoading = listLoading || statsLoading;

  const topChallenge = useMemo((): Challenge | null => {
    if (challenges.length === 0) return null;
    if (statsLoading) return null;

    let best: Challenge | null = null;
    let bestCount = -1;
    for (let i = 0; i < challenges.length; i++) {
      const count = statsQueries[i]?.data?.participantsCount ?? 0;
      if (count > bestCount) {
        bestCount = count;
        best = challenges[i];
      }
    }
    return best ?? challenges[0];
  }, [challenges, statsQueries, statsLoading]);

  return {
    challenge: topChallenge,
    isLoading,
  };
}
