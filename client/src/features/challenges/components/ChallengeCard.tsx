import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChallengeParticipantsPreview } from "./ChallengeParticipantsPreview";
import { cn } from "@/lib/utils";
import { oneLineSummary } from "../api/mappers";
import type { Challenge } from "../types";
import type { ParticipantPreviewUser } from "./ChallengeParticipantsPreview";

interface ChallengeCardProps {
  challenge: Challenge;
  isJoined?: boolean;
  participantCount?: number | null;
  participantsPreview?: ParticipantPreviewUser[];
  onJoin: (id: string) => void;
  joinLoading?: boolean;
  joinError?: "already_joined" | null;
  className?: string;
}

const visibilityLabels: Record<string, string> = {
  PERSONAL: "Personal",
  GROUP: "Group",
  PUBLIC: "Public",
};

export function ChallengeCard({
  challenge,
  isJoined,
  participantCount,
  participantsPreview,
  onJoin,
  joinLoading,
  joinError,
  className,
}: ChallengeCardProps) {
  const summary = oneLineSummary(challenge.description);
  const joined = isJoined ?? challenge.isJoined ?? false;

  return (
    <Link to={`/challenges/${challenge.id}`} className="block">
      <Card
        className={cn(
          "flex flex-col rounded-2xl border border-border shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:border-muted-foreground/20 transition-all",
          className
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-lg font-bold leading-tight line-clamp-2 flex-1 min-w-0">
              {challenge.title}
            </CardTitle>
            <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {visibilityLabels[challenge.visibility] ?? challenge.visibility}
            </span>
          </div>
          {summary !== "" && (
            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
              {summary}
            </p>
          )}
        </CardHeader>
        <CardContent className="flex-1 pb-3">
          {(participantCount != null && participantCount > 0) ||
          (participantsPreview != null && participantsPreview.length > 0) ? (
            <div className="flex items-center gap-2">
              <ChallengeParticipantsPreview
                count={participantCount ?? participantsPreview?.length ?? 0}
                usersPreview={participantsPreview}
                size="sm"
              />
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col gap-1.5 pt-0">
          {joinError === "already_joined" && !joined && (
            <p className="text-xs text-muted-foreground">Already joined</p>
          )}
          {joined ? (
            <Button
              className="w-full bg-emerald-600 text-white hover:bg-emerald-600 border-0 shadow-sm cursor-default"
              disabled
            >
              JOINED
            </Button>
          ) : (
            <Button
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 border-0 shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onJoin(challenge.id);
              }}
              disabled={joinLoading}
            >
              {joinLoading ? "Joining…" : "Join Challenge"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
