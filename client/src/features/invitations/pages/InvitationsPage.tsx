import { useState, useCallback, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { RowSkeleton } from "@/components/ui/LoadingSkeleton";
import { useInvites } from "../hooks/useInvites";
import { useApproveInvite } from "../hooks/useApproveInvite";
import { useDeclineInvite } from "../hooks/useDeclineInvite";
import { InviteCard } from "../components/InviteCard";
import { GroupPreviewDialog } from "../components/GroupPreviewDialog";
import type { Invite } from "../api/invitations.api";
import { cn } from "@/lib/utils";
import { Inbox, CheckCircle, XCircle } from "lucide-react";

const TAB_PENDING = "pending";
const TAB_ACCEPTED = "accepted";
const TAB_DECLINED = "declined";

export function InvitationsPage() {
  const { data: serverInvites = [], isLoading } = useInvites();
  const [toast, setToast] = useState<string | null>(null);
  const [locallyAccepted, setLocallyAccepted] = useState<Invite[]>([]);
  const [locallyDeclined, setLocallyDeclined] = useState<Invite[]>([]);

  const approveMutation = useApproveInvite({
    onSuccess: (data) => {
      setLocallyAccepted((prev) => [
        ...prev,
        { ...data, status: "APPROVED" as const },
      ]);
      setToast("Invite accepted. You can find the group in My Groups.");
    },
    onError: () => {
      setToast("Failed to accept invite. Please try again.");
    },
  });

  const declineMutation = useDeclineInvite({
    onSuccess: (data) => {
      setLocallyDeclined((prev) => [
        ...prev,
        { ...data, status: "DECLINED" as const },
      ]);
      setToast("Invite declined.");
    },
    onError: () => {
      setToast("Failed to decline invite. Please try again.");
    },
  });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const pendingInvites = serverInvites.filter((i) => i.status === "PENDING");
  const acceptedInvites = [
    ...serverInvites.filter((i) => i.status === "APPROVED"),
    ...locallyAccepted,
  ];
  const declinedInvites = [
    ...serverInvites.filter((i) => i.status === "DECLINED"),
    ...locallyDeclined,
  ];

  const [activeTab, setActiveTab] = useState<typeof TAB_PENDING | typeof TAB_ACCEPTED | typeof TAB_DECLINED>(TAB_PENDING);
  const [previewInvite, setPreviewInvite] = useState<Invite | null>(null);

  const handleApprove = useCallback(
    (id: string) => {
      approveMutation.mutate(id);
    },
    [approveMutation]
  );

  const handleDecline = useCallback(
    (id: string) => {
      declineMutation.mutate(id);
    },
    [declineMutation]
  );

  const isApproving = (id: string) => approveMutation.isPending && approveMutation.variables === id;
  const isDeclining = (id: string) => declineMutation.isPending && declineMutation.variables === id;

  const handleCardClick = useCallback((invite: Invite) => {
    setPreviewInvite(invite);
  }, []);

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

      <PageHeader title="Invitations" />

      <div className="border-b border-border mb-6">
        <nav className="flex gap-1" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab(TAB_PENDING)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors",
              activeTab === TAB_PENDING
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <Inbox className="size-4" />
              Pending
              {pendingInvites.length > 0 && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                  {pendingInvites.length}
                </span>
              )}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(TAB_ACCEPTED)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors",
              activeTab === TAB_ACCEPTED
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <CheckCircle className="size-4" />
              Accepted Invitations
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(TAB_DECLINED)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors",
              activeTab === TAB_DECLINED
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <XCircle className="size-4" />
              Declined
            </span>
          </button>
        </nav>
      </div>

      {activeTab === TAB_PENDING && (
        <div className="space-y-4">
          {isLoading ? (
            <Card className="rounded-2xl overflow-hidden">
              <CardContent className="p-5">
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <RowSkeleton key={i} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : pendingInvites.length === 0 ? (
            <Card className="rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <EmptyState
                  title="No pending invitations"
                  description="When someone invites you to a group, it will appear here."
                  icon={<Inbox className="size-10 text-muted-foreground" />}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingInvites.map((invite) => (
                <InviteCard
                  key={invite.id}
                  invite={invite}
                  onApprove={handleApprove}
                  onDecline={handleDecline}
                  onCardClick={handleCardClick}
                  isApproving={isApproving(invite.id)}
                  isDeclining={isDeclining(invite.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <GroupPreviewDialog
        open={!!previewInvite}
        onOpenChange={(open) => !open && setPreviewInvite(null)}
        inviteId={previewInvite?.id ?? null}
      />

      {activeTab === TAB_ACCEPTED && (
        <div className="space-y-4">
          {acceptedInvites.length === 0 ? (
            <Card className="rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <EmptyState
                  title="No accepted invitations yet"
                  description="When you accept an invite, the group will appear in My Groups. Accepted invites are also listed here."
                  icon={<CheckCircle className="size-10 text-muted-foreground" />}
                />
              </CardContent>
            </Card>
          ) : (
            acceptedInvites.map((invite) => (
              <InviteCard key={invite.id} invite={invite} />
            ))
          )}
        </div>
      )}

      {activeTab === TAB_DECLINED && (
        <div className="space-y-4">
          {declinedInvites.length === 0 ? (
            <Card className="rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <EmptyState
                  title="No declined invitations"
                  description="Declined invites will appear here."
                  icon={<XCircle className="size-10 text-muted-foreground" />}
                />
              </CardContent>
            </Card>
          ) : (
            declinedInvites.map((invite) => (
              <InviteCard key={invite.id} invite={invite} />
            ))
          )}
        </div>
      )}
    </AppLayout>
  );
}
