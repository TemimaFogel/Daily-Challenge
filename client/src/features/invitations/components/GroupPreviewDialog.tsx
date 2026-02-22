import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { invitationsApi } from "../api/invitations.api";
import type { InvitePreviewMember } from "../api/invitations.api";
import { resolveApiUrl } from "@/lib/urls";
import { EmptyState } from "@/components/ui/EmptyState";
import { RowSkeleton } from "@/components/ui/LoadingSkeleton";
import { Loader2, Users } from "lucide-react";

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

function MemberRow({ member }: { member: InvitePreviewMember }) {
  const initials = getInitials(member.name ?? null, member.email ?? null);
  const displayName = member.name?.trim() || member.email?.trim() || "—";
  const avatarUrl = resolveApiUrl(member.profileImageUrl);

  return (
    <div className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/50">
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
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground truncate">{displayName}</p>
        {member.email?.trim() && member.name?.trim() && (
          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
        )}
      </div>
    </div>
  );
}

export interface GroupPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, fetches GET /api/invites/{inviteId}/preview (for pending invite). */
  inviteId: string | null;
}

export function GroupPreviewDialog({
  open,
  onOpenChange,
  inviteId,
}: GroupPreviewDialogProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["invite-preview", inviteId],
    queryFn: () => invitationsApi.getPreview(inviteId!),
    enabled: open && Boolean(inviteId),
  });

  const isForbidden =
    isError &&
    (error as { response?: { status?: number } })?.response?.status === 403;

  const group = data?.group;
  const members = data?.members ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="pr-8">
            {group?.name?.trim() ?? "Group"}
          </DialogTitle>
          {group?.description?.trim() && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {group.description.trim()}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading
              ? "Loading…"
              : isForbidden
                ? "You can't preview this invite."
                : isError
                  ? "Unable to load preview"
                  : `${members.length} Member${members.length !== 1 ? "s" : ""}`}
          </p>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto -mx-2 px-2 mt-2 border-t border-border pt-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
              <p className="text-sm text-muted-foreground">Loading members…</p>
              <div className="space-y-2 w-full">
                {[1, 2, 3].map((i) => (
                  <RowSkeleton key={i} />
                ))}
              </div>
            </div>
          )}
          {!isLoading && isForbidden && (
            <EmptyState
              title="Preview not available"
              description="You can't preview this invite. It may have been declined or you don't have access."
            />
          )}
          {!isLoading && !isForbidden && isError && (
            <EmptyState
              title="Couldn't load preview"
              description="Something went wrong. Please try again."
            />
          )}
          {!isLoading && !isError && members.length === 0 && group != null && (
            <EmptyState
              title="No members"
              description="This group has no members yet."
              icon={<Users className="size-10 text-muted-foreground" />}
            />
          )}
          {!isLoading && !isError && members.length > 0 && (
            <div className="space-y-0.5">
              {members.map((member) => (
                <MemberRow key={member.id} member={member} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
