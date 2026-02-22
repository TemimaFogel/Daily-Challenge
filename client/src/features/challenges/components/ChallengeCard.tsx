import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarStack } from "./AvatarStack";
import { cn } from "@/lib/utils";
import { oneLineSummary } from "../api/mappers";
import type { Challenge } from "../types";

interface ChallengeCardProps {
  challenge: Challenge;
  /** When list API provides participant count (optional) */
  participantCount?: number | null;
  onJoin: (id: string) => void;
  joinLoading?: boolean;
  joinError?: "already_joined" | null;
  className?: string;
}

/** Placeholder avatars when API does not return participant identities (no fake names) */
function placeholderAvatarItems(count: number) {
  return Array.from({ length: Math.min(count, 5) }, () => ({
    name: "",
    imageUrl: null as string | null,
  }));
}

export function ChallengeCard({
  challenge,
  participantCount,
  onJoin,
  joinLoading,
  joinError,
  className,
}: ChallengeCardProps) {
  const summary = oneLineSummary(challenge.description);

  return (
    <Link to={`/challenges/${challenge.id}`} className="block">
      <Card
        className={cn(
          "flex flex-col rounded-2xl border border-border shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow",
          className
        )}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold leading-tight line-clamp-2">
            {challenge.title}
          </CardTitle>
          {summary !== "" && (
            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
              {summary}
            </p>
          )}
        </CardHeader>
        <CardContent className="flex-1 pb-3">
          <div className="flex items-center gap-2">
            <AvatarStack
              items={placeholderAvatarItems(participantCount != null && participantCount > 0 ? participantCount : 3)}
              max={5}
              size="sm"
              className="shrink-0"
            />
            <span className="text-xs text-muted-foreground">
              {participantCount != null && participantCount >= 0
                ? `${participantCount} participant${participantCount !== 1 ? "s" : ""}`
                : "Participants"}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-1.5 pt-0">
          {joinError === "already_joined" && (
            <p className="text-xs text-muted-foreground">Already joined</p>
          )}
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
        </CardFooter>
      </Card>
    </Link>
  );
}
