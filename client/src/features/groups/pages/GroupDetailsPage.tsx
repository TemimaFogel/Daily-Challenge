import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, Trophy, Calendar } from "lucide-react";
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
import { useGroupDashboard } from "../hooks/useGroupDashboard";
import { mapChallengeFromApi } from "@/features/challenges/api/mappers";
import type { GroupMember } from "../api/groups.api";

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
  const { data: dashboard, isLoading: loadingDashboard, isError: errorDashboard } = useGroupDashboard(id, Boolean(id));

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

  const challenges = dashboard?.challenges ?? [];
  const mappedChallenges = challenges
    .map((item) => (item.challenge ? mapChallengeFromApi(item.challenge) : null))
    .filter(Boolean);

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
                {loadingDashboard ? (
                  <div className="space-y-2">
                    <LoadingSkeleton className="h-4 w-full" />
                    <LoadingSkeleton className="h-4 w-4/5" />
                    <LoadingSkeleton className="h-4 w-3/5" />
                  </div>
                ) : errorDashboard ? (
                  <EmptyState
                    title="Challenges unavailable"
                    description="Could not load group challenges."
                  />
                ) : mappedChallenges.length === 0 ? (
                  <EmptyState
                    title="No challenges yet"
                    description="Challenges for this group will appear here."
                    icon={<Trophy className="size-10 text-muted-foreground" />}
                  />
                ) : (
                  <ul className="space-y-2">
                    {mappedChallenges.slice(0, 5).map((ch) => (
                      <li key={ch!.id}>
                        <Link
                          to={`/challenges/${ch!.id}`}
                          className="text-sm font-medium text-primary hover:underline block truncate"
                        >
                          {ch!.title}
                        </Link>
                        {ch!.challengeDate && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(ch!.challengeDate)}
                          </p>
                        )}
                      </li>
                    ))}
                    {mappedChallenges.length > 5 && (
                      <li className="text-xs text-muted-foreground pt-1">
                        +{mappedChallenges.length - 5} more
                      </li>
                    )}
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
