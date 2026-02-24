import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { useChallengesList, useJoinChallenge, usePersonalDashboard } from "../hooks/useChallenges";
import { ChallengeCard } from "../components/ChallengeCard";
import { ChallengeFilters } from "../components/ChallengeFilters";
import { CreateChallengeDialog } from "../components/CreateChallengeDialog";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getTodayLocal, isChallengeToday } from "../lib/dateUtils";
import type { Challenge, ChallengeListParams } from "../types";

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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { data: challenges = [], isLoading, error } = useChallengesList(params);
  const { data: dashboard } = usePersonalDashboard();
  const { data: currentUser } = useCurrentUser();
  const join = useJoinChallenge();

  const todayLocal = getTodayLocal(currentUser?.timezone ?? undefined);

  const dashboardChallengeIds = useMemo(
    () =>
      new Set(
        (dashboard?.challenges ?? [])
          .map((i) => i.challenge?.id)
          .filter(Boolean)
          .map(String)
      ),
    [dashboard?.challenges]
  );

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = q
      ? challenges.filter(
          (c) =>
            (c.title ?? "").toLowerCase().includes(q) ||
            (c.description ?? "").toLowerCase().includes(q)
        )
      : challenges;
    return list.map((c) => ({
      ...c,
      isJoined: !!c.isJoined || dashboardChallengeIds.has(c.id),
    }));
  }, [challenges, searchQuery, dashboardChallengeIds]);

  const activeChallenges = useMemo(
    () => (filtered as Challenge[]).filter((c) => c.isJoined),
    [filtered]
  );
  const availableChallenges = useMemo(
    () => (filtered as Challenge[]).filter((c) => !c.isJoined),
    [filtered]
  );

  const handleJoin = (id: string) => {
    const c = filtered.find((x) => x.id === id);
    if (c && !isChallengeToday(c.challengeDate, todayLocal)) return;
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
    </div>
  );

  return (
    <AppLayout title="Challenges" headerActions={headerActions}>
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-md bg-foreground text-background px-4 py-2 text-sm shadow-lg"
        >
          {toast}
        </div>
      )}
      <CreateChallengeDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={(message) => setToast(message)}
      />
      <PageHeader title="Challenges" hideTitle />

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
        <div className="space-y-8">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">
              Your Active Challenges
            </h2>
            {activeChallenges.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 rounded-xl bg-muted/30 border border-dashed border-border text-center">
                No active challenges yet. Join one below.
              </p>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {activeChallenges.map((c) => (
                  <ChallengeCard
                    key={c.id}
                    challenge={c}
                    isJoined={true}
                    isReadOnly={!isChallengeToday(c.challengeDate, todayLocal)}
                    onJoin={handleJoin}
                    joinLoading={join.isPending && joiningId === c.id}
                    joinError={
                      joiningId === c.id && joinError409 ? "already_joined" : null
                    }
                  />
                ))}
              </div>
            )}
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">
              Explore Challenges
            </h2>
            {availableChallenges.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No more challenges to join for this filter.
              </p>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {availableChallenges.map((c) => (
                  <ChallengeCard
                    key={c.id}
                    challenge={c}
                    isJoined={false}
                    isReadOnly={!isChallengeToday(c.challengeDate, todayLocal)}
                    onJoin={handleJoin}
                    joinLoading={join.isPending && joiningId === c.id}
                    joinError={
                      joiningId === c.id && joinError409 ? "already_joined" : null
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <button
        type="button"
        onClick={() => setCreateDialogOpen(true)}
        className="fixed bottom-6 right-6 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
        aria-label="Create new challenge"
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
