/** Today as YYYY-MM-DD in the given IANA timezone (fallback: browser timezone). */
export function getTodayLocal(timezone: string | null | undefined): string {
  const tz =
    timezone != null && String(timezone).trim() !== ""
      ? String(timezone).trim()
      : Intl.DateTimeFormat().resolvedOptions().timeZone;
  return new Date().toLocaleDateString("en-CA", { timeZone: tz });
}

/** Normalize API date to date-only YYYY-MM-DD for comparison. */
export function toDateOnly(s: string | null | undefined): string {
  if (s == null || String(s).trim() === "") return "";
  return String(s).trim().slice(0, 10);
}

export function isChallengeToday(
  challengeDate: string | null | undefined,
  todayLocal: string
): boolean {
  const d = toDateOnly(challengeDate);
  return d !== "" && d === todayLocal;
}
