import { http } from "@/api/http";
import type { ChallengeListParams, CreateChallengeRequest } from "../types";
import type { ChallengeDTO, ChallengeStatsDTO, GroupOptionDTO } from "../types";
import {
  mapChallengeFromApi,
  mapChallengeStatsFromApi,
  mapGroupOptionFromApi,
} from "./mappers";
import type { Challenge, ChallengeStats, GroupOption, CompletionUser, Comment } from "../types";

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

const COMMENT_MAX_LENGTH = 500;

function mapCommentFromApi(d: {
  id?: string | null;
  challengeId?: string | null;
  userId?: string | null;
  userDisplayName?: string | null;
  userProfileImageUrl?: string | null;
  content?: string | null;
  createdAt?: string | null;
}): Comment {
  return {
    id: d.id != null ? String(d.id) : "",
    challengeId: d.challengeId != null ? String(d.challengeId) : "",
    userId: d.userId != null ? String(d.userId) : "",
    userDisplayName: d.userDisplayName != null ? String(d.userDisplayName) : "—",
    userProfileImageUrl:
      d.userProfileImageUrl != null && String(d.userProfileImageUrl).trim() !== ""
        ? String(d.userProfileImageUrl)
        : null,
    content: d.content != null ? String(d.content) : "",
    createdAt: d.createdAt != null ? String(d.createdAt) : "",
  };
}

export { COMMENT_MAX_LENGTH };

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

  /**
   * Create a challenge. If image is provided, sends multipart/form-data (request + image);
   * otherwise sends JSON. When no image is sent, the backend may generate one via AI.
   */
  create(body: CreateChallengeRequest, image?: File | null): Promise<Challenge> {
    if (image != null && image.size > 0) {
      const form = new FormData();
      form.append("request", new Blob([JSON.stringify(body)], { type: "application/json" }));
      form.append("image", image);
      return http
        .post<ChallengeDTO>(BASE, form)
        .then((r) => mapChallengeFromApi(r.data ?? {}));
    }
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

  /** GET /api/challenges/:id/comments */
  getComments(id: string): Promise<Comment[]> {
    return http
      .get<Comment[]>(`${BASE}/${id}/comments`)
      .then((r) => (Array.isArray(r.data) ? r.data : []).map(mapCommentFromApi));
  },

  /** POST /api/challenges/:id/comments */
  postComment(id: string, content: string): Promise<Comment> {
    return http
      .post<Comment>(`${BASE}/${id}/comments`, { content: content.trim() })
      .then((r) => mapCommentFromApi(r.data ?? ({} as Comment)));
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

  /**
   * Replace the challenge image (creator only). PUT multipart/form-data with field "image".
   * Returns updated Challenge with new imageUrl.
   */
  replaceImage(id: string, file: File): Promise<Challenge> {
    const form = new FormData();
    form.append("image", file);
    return http
      .put<ChallengeDTO>(`${BASE}/${id}/image`, form)
      .then((r) => mapChallengeFromApi(r.data ?? {}));
  },

  /**
   * Regenerate the challenge image with AI (creator only). Uses title + description.
   * Returns updated Challenge with new imageUrl.
   */
  generateImage(id: string): Promise<Challenge> {
    return http
      .put<ChallengeDTO>(`${BASE}/${id}/image/generate`)
      .then((r) => mapChallengeFromApi(r.data ?? {}));
  },
};
