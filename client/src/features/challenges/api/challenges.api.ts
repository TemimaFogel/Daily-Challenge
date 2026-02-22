import { http } from "@/api/http";
import type { ChallengeListParams, CreateChallengeRequest } from "../types";
import type { ChallengeDTO, ChallengeStatsDTO, GroupOptionDTO } from "../types";
import {
  mapChallengeFromApi,
  mapChallengeStatsFromApi,
  mapGroupOptionFromApi,
} from "./mappers";
import type { Challenge, ChallengeStats, GroupOption, CompletionUser } from "../types";

function mapCompletionUserFromApi(d: {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  profileImageUrl?: string | null;
}): CompletionUser {
  return {
    id: d.id != null ? String(d.id) : "",
    name: d.name != null ? String(d.name) : "",
    email: d.email != null ? String(d.email) : null,
    profileImageUrl: d.profileImageUrl != null && String(d.profileImageUrl).trim() !== "" ? String(d.profileImageUrl) : null,
  };
}

const BASE = "/api/challenges";

function paramsToSearch(params: ChallengeListParams): string {
  const sp = new URLSearchParams();
  if (params.visibility != null) sp.set("visibility", params.visibility);
  if (params.creatorId != null) sp.set("creatorId", params.creatorId);
  if (params.groupId != null) sp.set("groupId", params.groupId);
  if (params.date != null) sp.set("date", params.date);
  if (params.from != null) sp.set("from", params.from);
  if (params.to != null) sp.set("to", params.to);
  const q = sp.toString();
  return q ? `?${q}` : "";
}

export const challengesApi = {
  getList(params?: ChallengeListParams): Promise<Challenge[]> {
    return http
      .get<ChallengeDTO[]>(BASE + paramsToSearch(params ?? {}))
      .then((r) => (Array.isArray(r.data) ? r.data : []).map(mapChallengeFromApi));
  },

  getOne(id: string): Promise<Challenge> {
    return http
      .get<ChallengeDTO>(`${BASE}/${id}`)
      .then((r) => mapChallengeFromApi(r.data ?? {}));
  },

  getStats(id: string): Promise<ChallengeStats> {
    return http
      .get<ChallengeStatsDTO>(`${BASE}/${id}/stats`)
      .then((r) => mapChallengeStatsFromApi(r.data ?? {}));
  },

  getGroupOptions(): Promise<GroupOption[]> {
    return http
      .get<GroupOptionDTO[]>(`${BASE}/group-options`)
      .then((r) => (Array.isArray(r.data) ? r.data : []).map(mapGroupOptionFromApi));
  },

  create(body: CreateChallengeRequest): Promise<Challenge> {
    return http
      .post<ChallengeDTO>(BASE, body)
      .then((r) => mapChallengeFromApi(r.data ?? {}));
  },

  join(id: string): Promise<void> {
    return http.post(`${BASE}/${id}/join`).then(() => undefined);
  },

  complete(id: string): Promise<void> {
    return http.post(`${BASE}/${id}/complete`).then(() => undefined);
  },

  /** GET /api/challenges/:id/completions?date=YYYY-MM-DD (date optional, defaults to today). */
  getCompletions(id: string, date?: string): Promise<CompletionUser[]> {
    const params = date != null && date.trim() !== "" ? { date: date.trim() } : {};
    return http
      .get<CompletionUser[]>(`${BASE}/${id}/completions`, { params })
      .then((r) => (Array.isArray(r.data) ? r.data : []).map(mapCompletionUserFromApi));
  },

  delete(id: string): Promise<void> {
    return http.delete(`${BASE}/${id}`).then(() => undefined);
  },
};
