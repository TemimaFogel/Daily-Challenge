import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authStore } from "@/auth/authStore";
import { getPersonalDashboard } from "@/api/dashboard.api";
import { challengesApi } from "../api/challenges.api";
import type { Challenge, ChallengeListParams, CreateChallengeRequest } from "../types";

const KEYS = {
  list: (params?: ChallengeListParams, userId?: string) =>
    ["challenges", "list", params, userId ?? ""] as const,
  one: (id: string) => ["challenges", "one", id] as const,
  stats: (id: string) => ["challenges", "stats", id] as const,
  completions: (id: string, date?: string) =>
    ["challenges", "completions", id, date ?? ""] as const,
  groupOptions: () => ["challenges", "groupOptions"] as const,
  personalDashboard: (userId: string) => ["dashboard", "personal", userId] as const,
};

export function useChallengesList(params?: ChallengeListParams) {
  const userId = authStore.getCurrentUserId();
  const token = authStore.getToken();
  return useQuery({
    queryKey: KEYS.list(params, userId ?? undefined),
    queryFn: () => challengesApi.getList(params),
    enabled: !!token && !!userId,
  });
}

export function usePersonalDashboard() {
  const userId = authStore.getCurrentUserId();
  const token = authStore.getToken();
  return useQuery({
    queryKey: KEYS.personalDashboard(userId ?? ""),
    queryFn: getPersonalDashboard,
    enabled: !!token && !!userId,
  });
}

export function useChallenge(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: KEYS.one(id!),
    queryFn: () => challengesApi.getOne(id!),
    enabled: enabled && !!id,
  });
}

/** Only fetch on detail page to avoid N+1 */
export function useChallengeStats(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: KEYS.stats(id!),
    queryFn: () => challengesApi.getStats(id!),
    enabled: enabled && !!id,
  });
}

/** Completions for a challenge on a date (default today). Use on detail page for "Completed Today" section. */
export function useChallengeCompletions(id: string | undefined, date?: string, enabled = true) {
  return useQuery({
    queryKey: KEYS.completions(id ?? "", date),
    queryFn: () => challengesApi.getCompletions(id!, date),
    enabled: enabled && !!id,
  });
}

export function useGroupOptions(enabled = true) {
  return useQuery({
    queryKey: KEYS.groupOptions(),
    queryFn: () => challengesApi.getGroupOptions(),
    enabled,
  });
}

export function useCreateChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateChallengeRequest) => challengesApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["challenges"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useJoinChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => challengesApi.join(id),
    onMutate: async (joinedId) => {
      await qc.cancelQueries({ queryKey: ["challenges", "list"] });
      const prevList: [unknown, Challenge[] | undefined][] = [];
      qc.getQueriesData<Challenge[]>({ queryKey: ["challenges", "list"] }).forEach(([key, data]) => {
        if (Array.isArray(data)) {
          prevList.push([key, data]);
          qc.setQueryData(
            key,
            data.map((c) =>
              c.id === joinedId ? { ...c, isJoined: true } : c
            )
          );
        }
      });
      return { prevList };
    },
    onError: (_err, _id, ctx) => {
      ctx?.prevList?.forEach(([key, data]) => {
        if (key != null && data != null) qc.setQueryData(key, data);
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["challenges"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onSuccess: (_, joinedId) => {
      qc.setQueryData(KEYS.one(joinedId), (prev: Challenge | undefined) =>
        prev ? { ...prev, isJoined: true } : prev
      );
    },
  });
}

function is409(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    (err as { response?: { status?: number } }).response?.status === 409
  );
}

export function useCompleteChallenge() {
  const qc = useQueryClient();
  const userId = authStore.getCurrentUserId();
  return useMutation({
    mutationFn: (id: string) => challengesApi.complete(id),
    onSuccess: (_, id) => {
      qc.setQueryData(KEYS.one(id), (prev: Challenge | undefined) =>
        prev ? { ...prev, completedToday: true } : prev
      );
      qc.invalidateQueries({ queryKey: KEYS.stats(id) });
      qc.invalidateQueries({ queryKey: ["challenges", "completions", id] });
      qc.invalidateQueries({ queryKey: ["challenges", "list"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      if (userId) {
        qc.invalidateQueries({ queryKey: ["history", userId] });
      }
    },
    onError: (err, id) => {
      if (is409(err)) {
        qc.setQueryData(KEYS.one(id), (prev: Challenge | undefined) =>
          prev ? { ...prev, completedToday: true } : prev
        );
        qc.invalidateQueries({ queryKey: KEYS.stats(id) });
        qc.invalidateQueries({ queryKey: ["challenges", "completions", id] });
        qc.invalidateQueries({ queryKey: ["challenges", "list"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
        if (userId) {
          qc.invalidateQueries({ queryKey: ["history", userId] });
        }
      }
    },
    onSettled: () => {},
  });
}

export function useDeleteChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => challengesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["challenges"] });
    },
  });
}
