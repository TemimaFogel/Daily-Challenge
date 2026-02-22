import { useState, useCallback, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, UserPlus, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { RowSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useMyGroups } from "../hooks/useMyGroups";
import { useGroupMembers } from "../hooks/useGroupMembers";
import { useGroupInvites } from "../hooks/useGroupInvites";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { InviteMembersPicker } from "../components/InviteMembersPicker";
import { groupsApi } from "../api/groups.api";
import type { GroupMember, GroupInviteView } from "../api/groups.api";
import { resolveApiUrl } from "@/lib/urls";
import type { UserSearchResult } from "../api/users.api";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const TAB_MEMBERS = "members";
const TAB_INVITES = "invites";

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

function StatusBadge({ status }: { status: GroupInviteView["status"] }) {
  const styles = {
    PENDING: "bg-muted text-muted-foreground",
    APPROVED: "bg-green-500/15 text-green-700 dark:text-green-400",
    DECLINED: "bg-red-500/15 text-red-700 dark:text-red-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        styles[status] ?? styles.PENDING
      )}
    >
      {status}
    </span>
  );
}

function InviteViewRow({ invite }: { invite: GroupInviteView }) {
  const inv = invite.invited;
  const displayName = inv.name?.trim() || inv.email?.trim() || "—";
  const avatarUrl = resolveApiUrl(inv.profileImageUrl);
  const initials = getInitials(inv.name ?? null, inv.email ?? null);
  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pr-4">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
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
            {inv.email?.trim() && inv.name?.trim() && (
              <p className="text-xs text-muted-foreground truncate">{inv.email}</p>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 pr-4 text-muted-foreground">{invite.groupName}</td>
      <td className="py-3">
        <StatusBadge status={invite.status} />
      </td>
    </tr>
  );
}

export function GroupManagePage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const { data: myGroups = [] } = useMyGroups();
  const groupFromCache = id ? myGroups.find((g) => g.id === id) : undefined;
  const ownerId = groupFromCache?.ownerId ?? null;
  const currentUserId = currentUser?.id ?? null;
  const isCreator = Boolean(
    id && currentUserId && ownerId && ownerId === currentUserId
  );

  const [activeTab, setActiveTab] = useState<typeof TAB_MEMBERS | typeof TAB_INVITES>(TAB_MEMBERS);
  const [removeTarget, setRemoveTarget] = useState<GroupMember | null>(null);
  const [removePending, setRemovePending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { data: members = [], isLoading: loadingMembers } = useGroupMembers(
    id,
    Boolean(id) && isCreator
  );
  const { data: invites = [], isLoading: loadingInvites, refetch: refetchInvites } = useGroupInvites(
    id,
    Boolean(id) && isCreator
  );

  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const [manualEmails, setManualEmails] = useState<string[]>([]);
  const [sendingInvites, setSendingInvites] = useState(false);

  const groupName = groupFromCache?.name?.trim() || "—";

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleRemoveMember = useCallback(() => {
    if (!id || !removeTarget) return;
    setRemovePending(true);
    groupsApi
      .removeMember(id, removeTarget.userId)
      .then(() => {
        setRemoveTarget(null);
        queryClient.invalidateQueries({ queryKey: ["groups", id, "members"] });
        queryClient.invalidateQueries({ queryKey: ["groups", "my"] });
      })
      .catch(() => {
        setToast("Failed to remove member.");
      })
      .finally(() => setRemovePending(false));
  }, [id, removeTarget, queryClient]);

  const inviteEmails = [
    ...selectedUsers.map((u) => u.email).filter(Boolean),
    ...manualEmails,
  ];

  const handleSendInvites = useCallback(() => {
    if (!id || inviteEmails.length === 0) return;
    setSendingInvites(true);
    Promise.allSettled(
      inviteEmails.map((email) => groupsApi.createInvite(id, { email }))
    ).then((results) => {
      const failed = results.filter((r) => r.status === "rejected").length;
      const succeeded = results.length - failed;
      refetchInvites();
      queryClient.invalidateQueries({ queryKey: ["groups", id, "invites"] });
      setSelectedUsers([]);
      setManualEmails([]);
      if (failed > 0) {
        setToast(
          `Sent ${succeeded} invite(s). ${failed} failed.`
        );
      } else {
        setToast(`Invites sent.`);
      }
      setSendingInvites(false);
    });
  }, [id, inviteEmails, refetchInvites, queryClient]);

  if (!id) {
    return (
      <AppLayout>
        <ErrorBanner message="Missing group ID." className="mb-6" />
      </AppLayout>
    );
  }

  if (!isCreator) {
    return (
      <AppLayout>
        <div className="mb-4">
          <Link
            to={`/groups/${id}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <ArrowLeft className="size-4 shrink-0" />
            Back to group
          </Link>
        </div>
        <ErrorBanner
          message="You are not allowed to manage this group."
          className="mb-6"
        />
        <Link to={`/groups/${id}`} className={buttonVariants({ variant: "outline" })}>
          Back to group
        </Link>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-md bg-foreground text-background px-4 py-2 text-sm shadow-lg"
        >
          {toast}
        </div>
      )}
      <div className="mb-4">
        <Link
          to={`/groups/${id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Back to group
        </Link>
      </div>

      <PageHeader
        title="Manage Group"
        description={groupName}
      />

      <div className="border-b border-border mb-6">
        <nav className="flex gap-1" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab(TAB_MEMBERS)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors",
              activeTab === TAB_MEMBERS
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <Users className="size-4" />
              Members
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(TAB_INVITES)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors",
              activeTab === TAB_INVITES
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <UserPlus className="size-4" />
              Invites
            </span>
          </button>
        </nav>
      </div>

      {activeTab === TAB_MEMBERS && (
        <Card className="rounded-2xl shadow-card-soft">
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
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-3 pr-4 font-medium">Member</th>
                      <th className="py-3 pr-4 font-medium">Role</th>
                      <th className="py-3 text-right font-medium w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => {
                      const isOwner = member.userId === ownerId;
                      return (
                        <tr
                          key={member.userId}
                          className="border-b border-border last:border-0"
                        >
                          <td className="py-3 pr-4">
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
                                  {getInitials(member.name ?? null, member.email ?? null)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-medium text-foreground truncate">
                                  {member.name?.trim() || member.email?.trim() || "—"}
                                </p>
                                {member.email?.trim() && member.name?.trim() && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {member.email}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            {isOwner ? (
                              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                Creator
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            {!isOwner && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:border-destructive"
                                onClick={() => setRemoveTarget(member)}
                              >
                                <Trash2 className="size-4 mr-1" />
                                Remove
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === TAB_INVITES && (
        <div className="space-y-6">
          <Card className="rounded-2xl shadow-card-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="size-4 shrink-0" />
                Invite members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InviteMembersPicker
                selectedUsers={selectedUsers}
                onSelectedUsersChange={setSelectedUsers}
                manualEmails={manualEmails}
                onManualEmailsChange={setManualEmails}
              />
              <Button
                onClick={handleSendInvites}
                disabled={inviteEmails.length === 0 || sendingInvites}
              >
                {sendingInvites ? "Sending…" : "Send Invites"}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-card-soft">
            <CardHeader>
              <CardTitle>Invite status</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingInvites ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <RowSkeleton key={i} />
                  ))}
                </div>
              ) : invites.length === 0 ? (
                <EmptyState
                  title="No invites yet"
                  description="Invites you send will appear here with their status."
                />
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="py-3 pr-4 font-medium">Invited user</th>
                        <th className="py-3 pr-4 font-medium">Group</th>
                        <th className="py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invites.map((inv) => (
                        <InviteViewRow key={inv.id} invite={inv} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove member?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {removeTarget
              ? `${removeTarget.name?.trim() || removeTarget.email || "This member"} will be removed from the group. They can be invited again later.`
              : ""}
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveTarget(null)}
              disabled={removePending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={removePending}
            >
              {removePending ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
