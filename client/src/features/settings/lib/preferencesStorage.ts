/**
 * Frontend-only preferences (no backend yet).
 * Scoped key to avoid collisions.
 */
const PREFIX = "dailychallenge.settings.";

export type PreferenceKey = "dailyReminders" | "groupInvites" | "completionConfirmations";

const DEFAULTS: Record<PreferenceKey, boolean> = {
  dailyReminders: true,
  groupInvites: true,
  completionConfirmations: true,
};

export function getPreference(key: PreferenceKey): boolean {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return DEFAULTS[key];
    return raw === "true";
  } catch {
    return DEFAULTS[key];
  }
}

export function setPreference(key: PreferenceKey, value: boolean): void {
  try {
    localStorage.setItem(PREFIX + key, String(value));
  } catch {
    // ignore
  }
}
