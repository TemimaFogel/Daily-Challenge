import { Link } from "react-router-dom";
import { Users, Trophy } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { GroupSummary } from "../api/groups.api";

interface GroupCardProps {
  group: GroupSummary;
  className?: string;
}

export function GroupCard({ group, className }: GroupCardProps) {
  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id ?? null;
  const isOwner = Boolean(currentUserId && group.ownerId && group.ownerId === currentUserId);
  const memberCount = typeof group.memberCount === "number" ? group.memberCount : 0;
  const description = group.description?.trim() ?? "";
  const detailsPath = `/groups/${group.id}`;
  const managePath = `/groups/${group.id}/manage`;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <Link
          to={detailsPath}
          className="flex items-center gap-2 min-w-0 flex-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="text-lg shrink-0" aria-hidden>
            👥
          </span>
          <h3 className="font-bold text-foreground truncate">
            {group.name?.trim() || "—"}
          </h3>
        </Link>
        {isOwner && (
          <Link
            to={managePath}
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "shrink-0")}
          >
            Manage
          </Link>
        )}
      </div>
      {description !== "" && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {description}
        </p>
      )}
      {description === "" && <div className="mb-4" />}
      <div className="mt-auto flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5 shrink-0" />
            {memberCount} Member{memberCount !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <Trophy className="size-3.5 shrink-0" />
            — Active Challenges
          </span>
        </div>
        <Link
          to={detailsPath}
          className={buttonVariants({ variant: "default", size: "sm" })}
        >
          View Group
        </Link>
      </div>
    </div>
  );
}
