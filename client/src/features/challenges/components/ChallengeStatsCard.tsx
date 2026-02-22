import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChallengeStatsCardProps {
  /** When undefined, show "—" */
  participating?: number;
  /** When undefined, show "—" */
  succeededToday?: number;
  className?: string;
}

/** Simple circular progress: 0–100, displayed as a ring */
function SuccessRateRing({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="size-24 -rotate-90" viewBox="0 0 100 100">
        <circle
          className="text-muted"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          cx="50"
          cy="50"
          r="45"
        />
        <circle
          className="text-primary transition-all duration-300"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          cx="50"
          cy="50"
          r="45"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <span className="absolute text-lg font-semibold text-foreground">{pct}%</span>
    </div>
  );
}

function formatStat(value: number | undefined): string {
  if (value === undefined) return "—";
  return String(value);
}

export function ChallengeStatsCard({
  participating,
  succeededToday,
  className,
}: ChallengeStatsCardProps) {
  const participatingNum =
    typeof participating === "number" && participating >= 0 ? participating : undefined;
  const succeededNum =
    typeof succeededToday === "number" && succeededToday >= 0 ? succeededToday : undefined;
  const rate =
    participatingNum != null &&
    participatingNum > 0 &&
    succeededNum != null
      ? (succeededNum / participatingNum) * 100
      : 0;

  return (
    <Card
      className={cn(
        "rounded-2xl border border-border shadow-sm overflow-hidden",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-2xl font-semibold text-foreground">
            {formatStat(participatingNum)}
          </p>
          <p className="text-xs text-muted-foreground">Participating</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-foreground">
            {formatStat(succeededNum)}
          </p>
          <p className="text-xs text-muted-foreground">Succeeded Today</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <SuccessRateRing value={rate} />
          <p className="text-xs text-muted-foreground">Success rate</p>
        </div>
      </CardContent>
    </Card>
  );
}
