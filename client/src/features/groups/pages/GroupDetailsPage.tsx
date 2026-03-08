import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, Trophy, Calendar, CheckCircle, UserPlus, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton, RowSkeleton } from "@/components/ui/LoadingSkeleton";
import { useMyGroups } from "../hooks/useMyGroups";
import { useGroupMembers } from "../hooks/useGroupMembers";
import { useGroupChallenges } from "../hooks/useGroupChallenges";
import { mapChallengeFromApi, oneLineSummary } from "@/features/challenges/api/mappers";
import type { GroupMember, GroupChallengeItem } from "../api/groups.api";
import { cn } from "@/lib/utils";

function getInitials(name: string | null, email: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2)
      return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
    return (parts[0]!.slice(0, 2) || "?").toUpperCase();
  }
  if (email?.trim()) {
    const part = email.trim().split("@")[0];
    return (part?.slice(0, 2) || "?").toUpperCase();
  }
  return "—";
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return "—";
  }
}

/** Format YYYY-MM-DD for display */
function formatChallengeDate(dateStr: string | null | undefined): string {
  if (!dateStr?.trim()) return "—";
  try {
    const d = new Date(dateStr + "T12:00:00");
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return "—";
  }
}

function isChallengeActive(challengeDateStr: string | null | undefined): boolean {
  if (!challengeDateStr?.trim()) return false;
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  const todayStr = `${y}-${m}-${d}`;
  return challengeDateStr.slice(0, 10) === todayStr;
}

function GroupChallengeCard({ item }: { item: GroupChallengeItem }) {
  const ch = mapChallengeFromApi(item.challenge);
  const active = isChallengeActive(item.challenge.challengeDate);
  const shortDesc = oneLineSummary(item.challenge.description);

  return (
    <Link
      to={`/challenges/${ch.id}`}
      className={cn(
        "block rounded-xl border border-border bg-card p-3 shadow-sm transition-colors hover:bg-muted/50",
        !active && "opacity-80"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="font-medium text-foreground truncate">{ch.title}</span>
            {active ? (
              <span className="inline-flex shrink-0 items-center rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Active
              </span>
            ) : (
              <span className="inline-flex shrink-0 items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                Archived
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatChallengeDate(item.challenge.challengeDate)}
          </p>
          {shortDesc && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{shortDesc}</p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {item.completed && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="size-3" />
                Completed
              </span>
            )}
            {item.joined && !item.completed && (
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                <UserPlus className="size-3" />
                Joined
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground mt-0.5" aria-hidden />
      </div>
    </Link>
  );
}

function MemberRow({
  member,
  isCreator,
}: {
  member: GroupMember;
  isCreator: boolean;
}) {
  const initials = getInitials(member.name ?? null, member.email ?? null);
  const displayName = member.name?.trim() || member.email?.trim() || "—";

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pr-3">
        <div className="flex items-center gap-3">
          {member.profileImageUrl ? (
            <img
              src={member.profileImageUrl}
              alt=""
              className="h-9 w-9 rounded-full object-cover shrink-0 bg-muted"
            />
          ) : (
            <div
              className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0"
              aria-hidden
            >
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{displayName}</p>
            {member.email?.trim() && member.name?.trim() && (
              <p className="text-xs text-muted-foreground truncate">
                {member.email}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 text-right align-middle">
        {isCreator && (
          <span
            className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
            title="Group creator"
          >
            Creator
          </span>
        )}
      </td>
    </tr>
  );
}

export function GroupDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const { data: myGroups = [] } = useMyGroups();
  const groupFromCache = id ? myGroups.find((g) => g.id === id) : undefined;
  const { data: members = [], isLoading: loadingMembers, isError: errorMembers } = useGroupMembers(id, Boolean(id));
  const { data: groupChallenges = [], isLoading: loadingChallenges, isError: errorChallenges } = useGroupChallenges(id, Boolean(id));

  const groupName = groupFromCache?.name?.trim() || "—";
  const groupDescription = groupFromCache?.description?.trim() || null;
  const ownerId = groupFromCache?.ownerId ?? null;
  const memberCount = groupFromCache?.memberCount ?? members.length;
  const createdAt = groupFromCache?.createdAt ?? null;

  const creatorMember = ownerId
    ? members.find((m) => m.userId === ownerId)
    : undefined;
  const createdByDisplay = creatorMember
    ? (creatorMember.name?.trim() || creatorMember.email?.trim() || "—")
    : "—";

  const hasMembersError = errorMembers;
  const showContent = !hasMembersError;

  return (
    <AppLayout title={groupName}>
      <div className="mb-4">
        <Link
          to="/groups"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Back to My Groups
        </Link>
      </div>

      <PageHeader
        title={groupName}
        description={
          groupDescription || `${memberCount} member${memberCount !== 1 ? "s" : ""}`
        }
      />

      {hasMembersError && (
        <ErrorBanner
          message="You may not have access to this group, or it could not be loaded."
          onRetry={() => window.location.reload()}
          className="mb-6"
        />
      )}

      {id && showContent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Members */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-4 shrink-0" />
                  Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingMembers ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <RowSkeleton key={i} />
                    ))}
                  </div>
                ) : members.length === 0 ? (
                  <EmptyState
                    title="No members"
                    description="No members in this group yet."
                  />
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full text-sm">
                      <tbody>
                        {members.map((member) => (
                          <MemberRow
                            key={member.userId}
                            member={member}
                            isCreator={member.userId === ownerId}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Summary + Challenges */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Group summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Created by</p>
                  <p className="font-medium text-foreground mt-0.5">
                    {loadingMembers ? "…" : createdByDisplay}
                  </p>
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                  <Users className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">Members:</span>
                  <span className="font-medium">
                    {loadingMembers ? "…" : memberCount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{formatDate(createdAt)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="size-4 shrink-0" />
                  Group Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingChallenges ? (
                  <div className="space-y-2">
                    <LoadingSkeleton className="h-20 w-full rounded-xl" />
                    <LoadingSkeleton className="h-20 w-full rounded-xl" />
                    <LoadingSkeleton className="h-20 w-full rounded-xl" />
                  </div>
                ) : errorChallenges ? (
                  <EmptyState
                    title="Challenges unavailable"
                    description="Could not load group challenges."
                  />
                ) : groupChallenges.length === 0 ? (
                  <EmptyState
                    title="No challenges yet"
                    description="Challenges for this group will appear here."
                    icon={<Trophy className="size-10 text-muted-foreground" />}
                  />
                ) : (
                  <ul className="space-y-2">
                    {groupChallenges.map((item) => (
                      <li key={String(item.challenge.id ?? "")}>
                        <GroupChallengeCard item={item} />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!id && (
        <ErrorBanner message="Missing group ID." className="mb-6" />
      )}
    </AppLayout>
  );
}
