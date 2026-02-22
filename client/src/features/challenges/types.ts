/** Matches backend Visibility enum */
export type Visibility = "PERSONAL" | "GROUP" | "PUBLIC";

// —— Raw DTOs (what the API actually returns; do not assume fields exist) ——

export interface ChallengeDTO {
  id?: string;
  title?: string | null;
  description?: string | null;
  visibility?: Visibility | null;
  challengeDate?: string | null;
  creatorId?: string | null;
  groupId?: string | null;
  createdAt?: string | null;
}

export interface ChallengeStatsDTO {
  challengeId?: string | null;
  participantsCount?: number;
  completionsCount?: number;
  winnersNames?: string[] | null;
  monthlySummary?: Record<string, number> | null;
}

export interface GroupOptionDTO {
  id?: string | null;
  label?: string | null;
  description?: string | null;
}

// —— Normalized display types (after mapping layer) ——

export interface Challenge {
  id: string;
  title: string;
  description: string;
  visibility: Visibility;
  challengeDate: string;
  creatorId: string;
  groupId: string | null;
  createdAt: string;
  /** Set by client when user has joined (from dashboard or optimistic update). */
  isJoined?: boolean;
  /** Set by client when user has completed today (from cache after complete mutation or 409). */
  completedToday?: boolean;
}

/** User who completed a challenge on a given date (from GET /api/challenges/:id/completions). */
export interface CompletionUser {
  id: string;
  name: string;
  email?: string | null;
  profileImageUrl?: string | null;
}

export interface ChallengeStats {
  challengeId: string;
  participantsCount: number;
  completionsCount: number;
  winnersNames: string[];
  monthlySummary: Record<string, number>;
}

export interface GroupOption {
  id: string;
  label: string;
  description: string | null;
}

export interface CreateChallengeRequest {
  title: string;
  description: string;
  visibility: Visibility;
  groupId?: string | null;
  challengeDate?: string | null;
}

/** Query params for GET /api/challenges */
export interface ChallengeListParams {
  visibility?: Visibility;
  creatorId?: string;
  groupId?: string;
  date?: string;
  from?: string;
  to?: string;
}
