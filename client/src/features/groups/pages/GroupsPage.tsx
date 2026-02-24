import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { useMyGroups } from "../hooks/useMyGroups";
import { GroupCard } from "../components/GroupCard";
import { CreateGroupCard } from "../components/CreateGroupCard";
import { CreateGroupDialog } from "../components/CreateGroupDialog";

function SearchIcon() {
  return (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

export function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { data: groups = [], isLoading, isError, refetch } = useMyGroups();

  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (g) =>
        (g.name ?? "").toLowerCase().includes(q) ||
        (g.description ?? "").toLowerCase().includes(q)
    );
  }, [groups, searchQuery]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleCreateSuccess = (message?: string) => {
    setToast(message ?? "Group created");
  };

  const headerActions = (
    <div className="flex items-center gap-2">
      <div className="relative">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          <SearchIcon />
        </span>
        <input
          type="search"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 w-40 rounded-md border border-input bg-background pl-8 pr-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </div>
  );

  return (
    <AppLayout title="Groups" headerActions={headerActions}>
      <PageHeader title="My Groups" hideTitle />
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
          {groups.length > 0 &&
            searchQuery.trim() !== "" &&
            filteredGroups.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                title="No groups found"
                description="Try a different search term."
              />
            </div>
          ) : (
            <>
              <CreateGroupCard onCreateClick={() => setDialogOpen(true)} />
              {filteredGroups.map((g) => (
                <GroupCard key={g.id} group={g} />
              ))}
            </>
          )}
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
