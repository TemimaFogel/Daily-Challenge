import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { useMyGroups } from "../hooks/useMyGroups";
import { GroupCard } from "../components/GroupCard";
import { CreateGroupCard } from "../components/CreateGroupCard";
import { CreateGroupDialog } from "../components/CreateGroupDialog";

export function GroupsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { data: groups = [], isLoading, isError, refetch } = useMyGroups();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleCreateSuccess = (message?: string) => {
    setToast(message ?? "Group created");
  };

  return (
    <AppLayout>
      <PageHeader title="My Groups" />
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-md bg-foreground text-background px-4 py-2 text-sm shadow-lg"
        >
          {toast}
        </div>
      )}
      {isError && (
        <ErrorBanner
          message="Could not load groups. Please try again."
          onRetry={() => refetch()}
          className="mb-6"
        />
      )}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground text-sm mb-2">
              You don&apos;t have any groups yet. Create one to get started.
            </div>
          )}
          <CreateGroupCard onCreateClick={() => setDialogOpen(true)} />
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} />
          ))}
        </div>
      )}
      <CreateGroupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </AppLayout>
  );
}
