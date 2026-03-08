import { Link } from "react-router-dom";
import { SoftCard } from "@/components/design";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { oneLineSummary } from "@/features/challenges/api/mappers";
import { mapChallengeFromApi } from "@/features/challenges/api/mappers";
import type { ChallengeDTO } from "@/features/challenges/types";

interface DashboardChallengeCardProps {
  challenge: ChallengeDTO;
  completedToday?: boolean;
  className?: string;
}

export function DashboardChallengeCard({
  challenge,
  completedToday,
  className,
}: DashboardChallengeCardProps) {
  const c = mapChallengeFromApi(challenge);
  const summary = oneLineSummary(c.description);

  if (!c.id) return null;

  return (
    <Link to={`/challenges/${c.id}`} className="block transition-transform hover:scale-[1.02]">
      <SoftCard className={`flex flex-col overflow-hidden cursor-pointer p-4 ${className ?? ""}`}>
        <div className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground line-clamp-2">
                {c.title}
              </h3>
              {summary !== "" && (
                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                  {summary}
                </p>
              )}
            </div>
            <span
              className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${
                completedToday
                  ? "bg-teal-500/15 text-teal-700 dark:text-teal-400"
                  : "bg-primary/15 text-primary"
              }`}
            >
              {completedToday ? "Completed" : "Joined"}
            </span>
          </div>
        </div>
        <div className="pt-2">
          {completedToday ? (
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent border-0 cursor-default"
              disabled
            >
              Completed
            </Button>
          ) : (
            <div
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "w-full cursor-pointer"
              )}
            >
              Open
            </div>
          )}
        </div>
      </SoftCard>
    </Link>
  );
}
