import { http } from "@/api/http";

export type Visibility = "PERSONAL" | "GROUP" | "PUBLIC";

export interface HistoryEntryDTO {
  date: string;
  challengeId: string;
  title: string;
  visibility: Visibility;
  groupId?: string | null;
  joined: boolean;
  completed: boolean;
  completedAt?: string | null;
}

export interface DailySummaryDTO {
  date: string;
  joinedCount: number;
  completedCount: number;
}

export interface HistoryResponseDTO {
  entries: HistoryEntryDTO[];
  dailySummaries: DailySummaryDTO[];
}

export function getHistory(from: string, to: string): Promise<HistoryResponseDTO> {
  return http
    .get<HistoryResponseDTO>("/api/history", { params: { from, to } })
    .then((r) => r.data ?? { entries: [], dailySummaries: [] });
}
