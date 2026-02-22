import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { COMMON_TIMEZONES } from "../lib/timezones";

function getTimezoneOptions(current: string): string[] {
  const set = new Set(COMMON_TIMEZONES);
  if (current && !set.has(current as any)) {
    return [current, ...COMMON_TIMEZONES];
  }
  return [...COMMON_TIMEZONES];
}
import type { PreferenceKey } from "../lib/preferencesStorage";
import { cn } from "@/lib/utils";

export interface PreferencesCardProps {
  timezone: string;
  onTimezoneChange: (tz: string) => void;
  onTimezoneSave: () => void;
  timezoneSaving: boolean;
  /** Local preferences (stored in localStorage until backend exists) */
  dailyReminders: boolean;
  groupInvites: boolean;
  completionConfirmations: boolean;
  onPreferenceToggle: (key: PreferenceKey, value: boolean) => void;
}

export function PreferencesCard({
  timezone,
  onTimezoneChange,
  onTimezoneSave,
  timezoneSaving,
  dailyReminders,
  groupInvites,
  completionConfirmations,
  onPreferenceToggle,
}: PreferencesCardProps) {
  return (
    <Card className="rounded-2xl border border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="settings-timezone" className="text-sm font-medium text-foreground">
            Timezone
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            <select
              id="settings-timezone"
              value={timezone}
              onChange={(e) => onTimezoneChange(e.target.value)}
              className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 max-w-xs w-full"
            >
              {getTimezoneOptions(timezone).map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            <Button
              type="button"
              onClick={onTimezoneSave}
              disabled={timezoneSaving}
            >
              {timezoneSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium text-foreground">Notifications</p>
          <p className="text-xs text-muted-foreground">
            Stored locally until server support is available.
          </p>
          <ToggleRow
            label="Daily challenge reminders"
            checked={dailyReminders}
            onToggle={() => onPreferenceToggle("dailyReminders", !dailyReminders)}
          />
          <ToggleRow
            label="Group invites"
            checked={groupInvites}
            onToggle={() => onPreferenceToggle("groupInvites", !groupInvites)}
          />
          <ToggleRow
            label="Completion confirmations"
            checked={completionConfirmations}
            onToggle={() => onPreferenceToggle("completionConfirmations", !completionConfirmations)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ToggleRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
      <span className="text-sm text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          checked ? "bg-primary" : "bg-input"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
