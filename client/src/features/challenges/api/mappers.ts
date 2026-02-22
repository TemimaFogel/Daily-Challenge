import type {
  ChallengeDTO,
  ChallengeStatsDTO,
  GroupOptionDTO,
  Challenge,
  ChallengeStats,
  GroupOption,
  Visibility,
} from "../types";

const VALID_VISIBILITIES: Visibility[] = ["PERSONAL", "GROUP", "PUBLIC"];

function isVisibility(v: unknown): v is Visibility {
  return typeof v === "string" && VALID_VISIBILITIES.includes(v as Visibility);
}

/**
 * Derive a readable title from description when title is missing.
 * Uses first line, first ~6 words; never returns fake or invented text.
 */
export function deriveTitleFromDescription(
  description: string | null | undefined
): string {
  if (description == null) return "—";
  const firstLine = String(description).split(/\n/)[0]?.trim() ?? "";
  if (!firstLine) return "—";
  const words = firstLine.split(/\s+/).filter(Boolean).slice(0, 6);
  if (words.length === 0) return "—";
  const rest = firstLine.split(/\s+/).filter(Boolean).slice(6);
  const suffix = rest.length > 0 ? "…" : "";
  return words.join(" ") + suffix;
}

export function mapChallengeFromApi(dto: ChallengeDTO): Challenge {
  const id = dto.id != null && String(dto.id).trim() !== "" ? String(dto.id) : "";
  const rawTitle = dto.title != null ? String(dto.title).trim() : "";
  const description = dto.description != null ? String(dto.description) : "";
  const title =
    rawTitle !== ""
      ? rawTitle
      : deriveTitleFromDescription(description || null);
  const visibility = isVisibility(dto.visibility) ? dto.visibility : "PUBLIC";
  const challengeDate =
    dto.challengeDate != null && String(dto.challengeDate).trim() !== ""
      ? String(dto.challengeDate)
      : "";
  const creatorId = dto.creatorId != null ? String(dto.creatorId) : "";
  const groupId =
    dto.groupId != null && String(dto.groupId).trim() !== ""
      ? String(dto.groupId)
      : null;
  const createdAt = dto.createdAt != null ? String(dto.createdAt) : "";

  return {
    id,
    title,
    description,
    visibility,
    challengeDate,
    creatorId,
    groupId,
    createdAt,
  };
}

export function mapChallengeStatsFromApi(dto: ChallengeStatsDTO): ChallengeStats {
  const challengeId =
    dto.challengeId != null && String(dto.challengeId).trim() !== ""
      ? String(dto.challengeId)
      : "";
  const participantsCount =
    typeof dto.participantsCount === "number" && dto.participantsCount >= 0
      ? dto.participantsCount
      : 0;
  const completionsCount =
    typeof dto.completionsCount === "number" && dto.completionsCount >= 0
      ? dto.completionsCount
      : 0;
  const winnersNames = Array.isArray(dto.winnersNames)
    ? dto.winnersNames.filter((n): n is string => typeof n === "string")
    : [];
  const monthlySummary =
    dto.monthlySummary != null && typeof dto.monthlySummary === "object"
      ? dto.monthlySummary
      : {};

  return {
    challengeId,
    participantsCount,
    completionsCount,
    winnersNames,
    monthlySummary,
  };
}

export function mapGroupOptionFromApi(dto: GroupOptionDTO): GroupOption {
  const id = dto.id != null && String(dto.id).trim() !== "" ? String(dto.id) : "";
  const label = dto.label != null ? String(dto.label) : "—";
  const description =
    dto.description != null && String(dto.description).trim() !== ""
      ? String(dto.description)
      : null;

  return { id, label, description };
}

/**
 * Format a date-only ISO string (yyyy-MM-dd) for display. Returns "—" when missing or invalid.
 */
export function formatDateSafe(
  iso: string | null | undefined
): string {
  if (iso == null || String(iso).trim() === "") return "—";
  try {
    const d = new Date(iso + "T12:00:00Z");
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

/**
 * One-line summary from description (first line, clamped). Returns "" when nothing to show.
 */
export function oneLineSummary(description: string | null | undefined): string {
  if (description == null) return "";
  const line = String(description).split(/\n/)[0]?.trim() ?? "";
  return line.length > 100 ? line.slice(0, 97) + "…" : line;
}
