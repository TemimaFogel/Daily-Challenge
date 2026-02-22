import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  useChallenge,
  useChallengeStats,
  useChallengeCompletions,
  useJoinChallenge,
  useCompleteChallenge,
  usePersonalDashboard,
} from "../hooks/useChallenges";
import { ChallengeStatsCard } from "../components/ChallengeStatsCard";
import { AvatarStack } from "../components/AvatarStack";
import { formatDateSafe } from "../api/mappers";
import { resolveApiUrl } from "@/lib/urls";

function BellIcon() {
  return (
    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

type LocationState = { from?: string; date?: string } | null;

export function ChallengeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) ?? null;
  const fromHistory = state?.from === "history";
  const historyDate = state?.date ?? null;

  const { data: challenge, isLoading: loadingChallenge, error } = useChallenge(id);

  const handleBack = () => {
    if (fromHistory) {
      navigate("/history", { state: historyDate ? { selectedDate: historyDate } : undefined });
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/challenges");
    }
  };
  const { data: stats, isLoading: loadingStats } = useChallengeStats(id);
  const { data: completionsToday = [], isLoading: loadingCompletions } = useChallengeCompletions(id);
  const { data: dashboard } = usePersonalDashboard();
  const join = useJoinChallenge();
  const complete = useCompleteChallenge();

  const isJoined =
    challenge?.isJoined === true ||
    (id != null &&
      (dashboard?.challenges ?? []).some(
        (c) => c.challenge?.id != null && String(c.challenge.id) === id
      ));

  const completedToday = challenge?.completedToday === true;

  const joinError409 =
    join.isError &&
    typeof join.error === "object" &&
    join.error !== null &&
    "response" in join.error &&
    (join.error as { response?: { status?: number } }).response?.status === 409;

  const completeError403 =
    complete.isError &&
    typeof complete.error === "object" &&
    complete.error !== null &&
    "response" in complete.error &&
    (complete.error as { response?: { status?: number } }).response?.status === 403;

  const completeError409 =
    complete.isError &&
    typeof complete.error === "object" &&
    complete.error !== null &&
    "response" in complete.error &&
    (complete.error as { response?: { status?: number } }).response?.status === 409;
  const completeIsAlreadyDone = completedToday || completeError409;

  const headerActions = (
    <div className="flex items-center gap-2">
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

  if (error || (challenge == null && !loadingChallenge)) {
    return (
      <AppLayout title="Challenge">
        <p className="text-destructive">Challenge not found.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/challenges">Back to Challenges</Link>
        </Button>
      </AppLayout>
    );
  }

  if (loadingChallenge || !challenge) {
    return (
      <AppLayout title="Challenge">
        <LoadingSkeleton className="h-8 w-2/3 mb-4" />
        <LoadingSkeleton className="h-4 w-full mb-2" />
        <LoadingSkeleton className="h-4 w-3/4" />
      </AppLayout>
    );
  }

  const hasDate = challenge.challengeDate != null && challenge.challengeDate.trim() !== "";
  const completionItems =
    completionsToday.length > 0
      ? completionsToday.map((u) => ({
          name: u.name || "—",
          imageUrl: resolveApiUrl(u.profileImageUrl) ?? null,
        }))
      : [];

  return (
    <AppLayout title={challenge.title} headerActions={headerActions}>
      <div className="mb-6">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          aria-label={fromHistory ? "Back to History" : "Back to Challenges"}
        >
          <ArrowLeft className="size-4 shrink-0" />
          {fromHistory ? "Back to History" : "Back to Challenges"}
        </button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="flex-1 min-w-0">
          <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold">{challenge.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {challenge.description.trim() !== "" ? challenge.description : "—"}
              </p>

              {hasDate && (
                <p className="text-sm text-muted-foreground">
                  Today, {formatDateSafe(challenge.challengeDate)} · Ends today
                </p>
              )}

              {stats != null && (
                <p className="text-sm text-muted-foreground">
                  {stats.completionsCount} participant
                  {stats.completionsCount !== 1 ? "s have" : " has"} completed this
                  challenge.
                </p>
              )}

              <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-foreground">Completed Today</h3>
                  <span className="rounded-full bg-primary/15 text-primary px-2 py-0.5 text-xs font-medium">
                    {loadingCompletions ? "…" : completionsToday.length}
                  </span>
                </div>
                {loadingCompletions ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : completionsToday.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No one has completed yet today.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    <AvatarStack items={completionItems} max={8} size="md" />
                    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      {completionsToday.map((u) => (
                        <li key={u.id} className="flex items-center gap-1.5">
                          <span
                            className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
                            aria-hidden
                          >
                            {u.name ? u.name.charAt(0).toUpperCase() : "?"}
                          </span>
                          {u.name || "—"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {!isJoined && (
                  <Button
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 border-0"
                    onClick={() => join.mutate(challenge.id)}
                    disabled={join.isPending}
                  >
                    {join.isPending ? "Joining…" : "Join"}
                  </Button>
                )}
                {completeIsAlreadyDone ? (
                  <Button
                    className="bg-emerald-600 text-white hover:bg-emerald-600 border-0 cursor-default"
                    disabled
                  >
                    Completed Today
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => complete.mutate(challenge.id)}
                    disabled={complete.isPending}
                  >
                    {complete.isPending ? "…" : "Complete for Today"}
                  </Button>
                )}
              </div>

              {joinError409 && !isJoined && (
                <p className="text-sm text-muted-foreground">Already joined.</p>
              )}
              {completeError403 && (
                <p className="text-sm text-amber-600 dark:text-amber-500">
                  Join required before completing.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="w-full lg:w-72 shrink-0">
          {loadingStats ? (
            <LoadingSkeleton className="h-64 w-full rounded-2xl" />
          ) : stats != null ? (
            <ChallengeStatsCard
              participating={stats.participantsCount}
              succeededToday={stats.completionsCount}
            />
          ) : null}
        </aside>
      </div>
    </AppLayout>
  );
}
