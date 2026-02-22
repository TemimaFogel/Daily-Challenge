import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { challengesApi } from "../api/challenges.api";
import type { ChallengeListParams, CreateChallengeRequest } from "../types";

const KEYS = {
  list: (params?: ChallengeListParams) => ["challenges", "list", params] as const,
  one: (id: string) => ["challenges", "one", id] as const,
  stats: (id: string) => ["challenges", "stats", id] as const,
  groupOptions: () => ["challenges", "groupOptions"] as const,
};

export function useChallengesList(params?: ChallengeListParams) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => challengesApi.getList(params),
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
    },
  });
}

export function useJoinChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => challengesApi.join(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: KEYS.one(id) });
      qc.invalidateQueries({ queryKey: ["challenges", "list"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCompleteChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => challengesApi.complete(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: KEYS.one(id) });
      qc.invalidateQueries({ queryKey: KEYS.stats(id) });
      qc.invalidateQueries({ queryKey: ["challenges", "list"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
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
