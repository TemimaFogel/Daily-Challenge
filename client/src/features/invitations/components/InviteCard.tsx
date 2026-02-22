import { Link } from "react-router-dom";
import { Users, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Invite, InviteStatus } from "../api/invitations.api";

interface InviteCardProps {
  invite: Invite;
  /** PENDING: show Approve + Decline; APPROVED: show badge + View Group; DECLINED: show badge only */
  onApprove?: (id: string) => void;
  onDecline?: (id: string) => void;
  /** Called when card (excluding buttons) is clicked; e.g. open members modal */
  onCardClick?: (invite: Invite) => void;
  isApproving?: boolean;
  isDeclining?: boolean;
  /** Optional stats (if backend provided); otherwise hide or minimal */
  memberCount?: number | null;
  activeChallenges?: number | null;
}

function getGroupDisplayName(invite: Invite): string {
  return invite.group?.name?.trim() || "Group";
}

function getGroupDescription(invite: Invite): string | null {
  const d = invite.group?.description?.trim();
  return d && d.length > 0 ? d : null;
}

function getGroupId(invite: Invite): string {
  return invite.group?.id || invite.groupId || "";
}

function StatusBadge({ status }: { status: InviteStatus }) {
  const styles: Record<InviteStatus, string> = {
    PENDING: "bg-muted text-muted-foreground",
    APPROVED: "bg-green-500/15 text-green-700 dark:text-green-400",
    DECLINED: "bg-red-500/15 text-red-700 dark:text-red-400",
  };
  const labels: Record<InviteStatus, string> = {
    PENDING: "Pending",
    APPROVED: "Accepted",
    DECLINED: "Declined",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        styles[status] ?? styles.PENDING
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}

export function InviteCard({
  invite,
  onApprove,
  onDecline,
  onCardClick,
  isApproving = false,
  isDeclining = false,
  memberCount = null,
  activeChallenges = null,
}: InviteCardProps) {
  const groupName = getGroupDisplayName(invite);
  const description = getGroupDescription(invite);
  const showStats =
    typeof memberCount === "number" || typeof activeChallenges === "number";
  const isPending = invite.status === "PENDING";
  const isApproved = invite.status === "APPROVED";
  const isClickable = isPending && onCardClick;

  const handleCardClick = () => {
    if (isClickable) onCardClick?.(invite);
  };

  const handleButtonClick = (e: React.MouseEvent, fn?: () => void) => {
    e.stopPropagation();
    fn?.();
  };

  return (
    <Card
      className={cn(
        "rounded-2xl border border-border bg-card shadow-card-soft overflow-hidden transition-shadow",
        isClickable && "cursor-pointer hover:shadow-md"
      )}
      onClick={isClickable ? handleCardClick : undefined}
      role={isClickable ? "button" : undefined}
    >
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg shrink-0" aria-hidden>
                👥
              </span>
              <h3 className="font-bold text-foreground truncate">{groupName}</h3>
            </div>
            {description != null && description !== "" && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                {description}
              </p>
            )}
            {showStats && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {typeof memberCount === "number" && (
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5 shrink-0" />
                    {memberCount} member{memberCount !== 1 ? "s" : ""}
                  </span>
                )}
                {typeof activeChallenges === "number" && (
                  <span className="flex items-center gap-1.5">
                    <Trophy className="size-3.5 shrink-0" />
                    {activeChallenges} active challenge
                    {activeChallenges !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}
          </div>
          <div
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {isPending && (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={(e) => handleButtonClick(e, () => onApprove?.(invite.id))}
                  disabled={isApproving || isDeclining}
                >
                  {isApproving ? "Accepting…" : "Approve"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:border-destructive"
                  onClick={(e) => handleButtonClick(e, () => onDecline?.(invite.id))}
                  disabled={isApproving || isDeclining}
                >
                  {isDeclining ? "Declining…" : "Decline"}
                </Button>
              </>
            )}
            {isApproved && (
              <>
                <StatusBadge status="APPROVED" />
                <Link
                  to={`/groups/${getGroupId(invite)}`}
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  View Group
                </Link>
              </>
            )}
            {invite.status === "DECLINED" && (
              <StatusBadge status="DECLINED" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
