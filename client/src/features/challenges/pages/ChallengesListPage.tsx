import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { useChallengesList, useJoinChallenge } from "../hooks/useChallenges";
import { ChallengeCard } from "../components/ChallengeCard";
import { ChallengeFilters } from "../components/ChallengeFilters";
import type { ChallengeListParams } from "../types";

function SearchIcon() {
  return (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

export function ChallengesListPage() {
  const [params, setParams] = useState<ChallengeListParams>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const { data: challenges = [], isLoading, error } = useChallengesList(params);
  const join = useJoinChallenge();

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return challenges;
    return challenges.filter(
      (c) =>
        (c.title ?? "").toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q)
    );
  }, [challenges, searchQuery]);

  const handleJoin = (id: string) => {
    setJoiningId(id);
    join.mutate(id, {
      onSettled: () => {
        setJoiningId(null);
      },
    });
  };

  const joinError409 =
    join.isError &&
    typeof join.error === "object" &&
    join.error !== null &&
    "response" in join.error &&
    (join.error as { response?: { status?: number } }).response?.status === 409;

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
      <button
        type="button"
        className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Notifications"
      >
        <BellIcon />
      </button>
      <div
        className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground"
        aria-hidden
      >
        U
      </div>
    </div>
  );

  return (
    <AppLayout title="Challenges List" headerActions={headerActions}>
      <PageHeader title="Challenges List" />

      <ChallengeFilters
        visibility={params.visibility}
        onVisibilityChange={(v) => setParams((p) => ({ ...p, visibility: v }))}
        className="mb-6"
      />

      {error && (
        <p className="text-sm text-destructive mb-4">
          Failed to load challenges. Please try again.
        </p>
      )}

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : !filtered.length ? (
        <EmptyState
          title="No challenges found"
          description="Try changing the filter or search."
        />
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {filtered.map((c) => (
            <ChallengeCard
              key={c.id}
              challenge={c}
              onJoin={handleJoin}
              joinLoading={join.isPending && joiningId === c.id}
              joinError={
                joiningId === c.id && joinError409 ? "already_joined" : null
              }
            />
          ))}
        </div>
      )}

      <button
        type="button"
        className="fixed bottom-6 right-6 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
        aria-label="Add challenge"
      >
        <PlusIcon />
      </button>
    </AppLayout>
  );
}

function PlusIcon() {
  return (
    <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
