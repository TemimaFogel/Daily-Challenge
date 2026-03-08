import { http } from "@/api/http";
import type { ChallengeDTO, ChallengeStatsDTO } from "@/features/challenges/types";

export interface PersonalDashboardItemDTO {
  challenge: ChallengeDTO;
  completedToday?: boolean;
}

export interface PersonalDashboardDTO {
  totalChallengesSignedFor?: number;
  totalCompletions?: number;
  activeDailyChallenges?: number;
  streak?: number;
  last30DaysCompletions?: Record<string, number>;
  challenges?: PersonalDashboardItemDTO[];
}

export interface GroupDashboardItemDTO {
  challenge: ChallengeDTO;
  stats: ChallengeStatsDTO;
}

export interface GroupDashboardDTO {
  totalChallengesSignedFor?: number;
  totalCompletions?: number;
  activeDailyChallenges?: number;
  last30DaysCompletions?: Record<string, number>;
  challenges?: GroupDashboardItemDTO[];
}

/** GET /api/dashboard/personal - current user's dashboard (active challenges for today). */
export function getPersonalDashboard(): Promise<PersonalDashboardDTO> {
  return http.get<PersonalDashboardDTO>("/api/dashboard/personal").then((r) => r.data ?? {});
}

/** GET /api/dashboard/group/{id} - group dashboard (challenges + stats). Requires group membership. */
export function getGroupDashboard(groupId: string): Promise<GroupDashboardDTO> {
  return http
    .get<GroupDashboardDTO>(`/api/dashboard/group/${groupId}`)
    .then((r) => r.data ?? {});
}
