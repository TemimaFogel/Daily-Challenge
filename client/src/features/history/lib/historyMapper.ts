import type { HistoryEntryDTO, DailySummaryDTO } from "../api/history.api";
import {
  addDays,
  startOfMonth,
  endOfMonth,
  format,
  parseISO,
} from "date-fns";

export interface DayEntry {
  date: string;
  challengeId: string;
  title: string;
  visibility: "PERSONAL" | "GROUP" | "PUBLIC";
  groupId: string | null;
  joined: boolean;
  completed: boolean;
  completedAt: string | null;
}

export interface DaySummary {
  date: string;
  joinedCount: number;
  completedCount: number;
}

export interface HistoryMonthData {
  entriesByDate: Record<string, DayEntry[]>;
  summaryByDate: Record<string, DaySummary>;
  entries: DayEntry[];
  dailySummaries: DaySummary[];
}

export function buildHistoryMonthData(
  entries: HistoryEntryDTO[],
  dailySummaries: DailySummaryDTO[]
): HistoryMonthData {
  const entriesByDate: Record<string, DayEntry[]> = {};
  const summaryByDate: Record<string, DaySummary> = {};

  for (const d of dailySummaries) {
    summaryByDate[d.date] = {
      date: d.date,
      joinedCount: d.joinedCount ?? 0,
      completedCount: d.completedCount ?? 0,
    };
  }

  for (const e of entries) {
    const entry: DayEntry = {
      date: e.date,
      challengeId: e.challengeId,
      title: e.title ?? "—",
      visibility: e.visibility ?? "PUBLIC",
      groupId: e.groupId ?? null,
      joined: e.joined ?? false,
      completed: e.completed ?? false,
      completedAt: e.completedAt ?? null,
    };
    if (!entriesByDate[e.date]) entriesByDate[e.date] = [];
    entriesByDate[e.date].push(entry);
  }

  return {
    entriesByDate,
    summaryByDate,
    entries,
    dailySummaries: dailySummaries.map((d) => ({
      date: d.date,
      joinedCount: d.joinedCount ?? 0,
      completedCount: d.completedCount ?? 0,
    })),
  };
}

export function getEntriesForDate(
  data: HistoryMonthData,
  dateStr: string
): DayEntry[] {
  return data.entriesByDate[dateStr] ?? [];
}

export function getSummaryForDate(
  data: HistoryMonthData,
  dateStr: string
): DaySummary | null {
  return data.summaryByDate[dateStr] ?? null;
}

/** Compute streak: consecutive days (today or yesterday going back) with at least one completion. */
export function computeStreak(dailySummaries: DaySummary[], todayStr: string): number {
  const set = new Set(dailySummaries.filter((d) => d.completedCount > 0).map((d) => d.date));
  let streak = 0;
  try {
    const today = parseISO(todayStr);
    let d = today;
    while (set.has(format(d, "yyyy-MM-dd"))) {
      streak++;
      d = addDays(d, -1);
    }
    if (streak === 0) {
      const yesterday = addDays(today, -1);
      if (set.has(format(yesterday, "yyyy-MM-dd"))) {
        d = yesterday;
        while (set.has(format(d, "yyyy-MM-dd"))) {
          streak++;
          d = addDays(d, -1);
        }
      }
    }
  } catch {
    // ignore parse errors
  }
  return streak;
}

/** Month bounds (inclusive) as YYYY-MM-DD for the given date. */
export function monthRange(date: Date): { from: string; to: string } {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return {
    from: format(start, "yyyy-MM-dd"),
    to: format(end, "yyyy-MM-dd"),
  };
}

export { format, parseISO, startOfMonth, endOfMonth, addDays };
