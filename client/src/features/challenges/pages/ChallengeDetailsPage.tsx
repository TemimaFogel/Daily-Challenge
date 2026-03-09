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
  useChallengeComments,
  usePostComment,
  useJoinChallenge,
  useCompleteChallenge,
  usePersonalDashboard,
} from "../hooks/useChallenges";
import { ChallengeCardImage } from "../components/ChallengeCardImage";
import { ChallengeStatsCard } from "../components/ChallengeStatsCard";
import { AvatarStack } from "../components/AvatarStack";
import { formatDateSafe } from "../api/mappers";
import { resolveApiUrl } from "@/lib/urls";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getTodayLocal, toDateOnly } from "../lib/dateUtils";
import { UserAvatar } from "@/components/design/UserAvatar";
import { COMMENT_MAX_LENGTH } from "../api/challenges.api";
import type { Comment } from "../types";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { cn } from "@/lib/utils";

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
  const { data: currentUser } = useCurrentUser();
  const { token } = useAuth();
  const isAuthenticated = !!token;
  const join = useJoinChallenge();
  const complete = useCompleteChallenge();
  const { data: comments = [], isLoading: loadingComments } = useChallengeComments(id);
  const postComment = usePostComment(id);
  const [commentText, setCommentText] = useState("");

  const todayLocal = getTodayLocal(currentUser?.timezone ?? undefined);
  const challengeDateLocal = challenge ? toDateOnly(challenge.challengeDate) : "";
  const isTodayChallenge =
    challengeDateLocal !== "" && challengeDateLocal === todayLocal;
  const isReadOnly = !isTodayChallenge;

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

  // const headerActions = (
  //   <div className="flex items-center gap-2">
  //     <button
  //       type="button"
  //       className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
  //       aria-label="Notifications"
  //     >
  //       <BellIcon />
  //     </button>
  //     <div
  //       className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground"
  //       aria-hidden
  //     >
  //       U
  //     </div>
  //   </div>
  // );

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
    <AppLayout title={challenge.title}>
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
            <div className="w-full h-44 sm:h-52 shrink-0 overflow-hidden rounded-t-2xl bg-muted">
              <ChallengeCardImage imageUrl={challenge.imageUrl} title={challenge.title} className="h-44 sm:h-52 w-full" />
            </div>
            <CardHeader>
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-xl font-bold">{challenge.title}</CardTitle>
                {isReadOnly && (
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    Archived
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {challenge.description.trim() !== "" ? challenge.description : "—"}
              </p>

              {hasDate && (
                <p className="text-sm text-muted-foreground">
                  {isTodayChallenge
                    ? `Today, ${formatDateSafe(challenge.challengeDate)} · Ends today`
                    : formatDateSafe(challenge.challengeDate)}
                </p>
              )}

              {stats != null && (
                <p className="text-sm text-muted-foreground">
                  {stats.completionsCount} participant
                  {stats.completionsCount !== 1 ? "s have" : " has"} completed this
                  challenge.
                </p>
              )}
              {isTodayChallenge && (
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
              )}

              {isReadOnly ? (
                <div className="rounded-lg border border-border bg-muted/50 px-3 py-2.5">
                  <p className="text-sm text-muted-foreground">
                    This is a past challenge. Actions are disabled.
                  </p>
                  {(isJoined || completeIsAlreadyDone) && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {isJoined && "You joined this challenge."}
                      {isJoined && completeIsAlreadyDone && " "}
                      {completeIsAlreadyDone && "You completed it."}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {!isJoined && (
                      <Button
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 border-0"
                        onClick={() => {
                          if (isReadOnly) return;
                          join.mutate(challenge.id);
                        }}
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
                        onClick={() => {
                          if (isReadOnly) return;
                          complete.mutate(challenge.id);
                        }}
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
                </>
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

      {/* Comments section */}
      <section className="mt-10 border-t border-border pt-8" aria-labelledby="comments-heading">
        <h2
          id="comments-heading"
          className="flex items-center gap-2 text-lg font-semibold text-foreground mb-6"
        >
          <MessageCircle className="size-5 text-muted-foreground" />
          What people say about this challenge
        </h2>

        {isAuthenticated && (
          <div className="mb-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = commentText.trim();
                if (!trimmed || postComment.isPending) return;
                postComment.mutate(trimmed, {
                  onSuccess: () => {
                    setCommentText("");
                  },
                });
              }}
              className="space-y-3"
            >
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value.slice(0, COMMENT_MAX_LENGTH))}
                placeholder="Share your thoughts…"
                rows={3}
                maxLength={COMMENT_MAX_LENGTH}
                className={cn(
                  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "resize-y min-h-[80px]"
                )}
                aria-label="Comment"
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={!commentText.trim() || postComment.isPending}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    commentText.trim() && !postComment.isPending
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {postComment.isPending ? "Posting…" : "Post comment"}
                </button>
                <span className="text-xs text-muted-foreground">
                  {commentText.length}/{COMMENT_MAX_LENGTH}
                </span>
              </div>
              {postComment.isError && (
                <p className="text-sm text-destructive">
                  {postComment.error instanceof Error
                    ? postComment.error.message
                    : "Failed to post comment. Try again."}
                </p>
              )}
            </form>
          </div>
        )}

        <div className="space-y-4">
          {loadingComments ? (
            <>
              <LoadingSkeleton className="h-20 w-full rounded-xl" />
              <LoadingSkeleton className="h-20 w-full rounded-xl" />
              <LoadingSkeleton className="h-20 w-full rounded-xl" />
            </>
          ) : comments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
              <MessageCircle className="size-10 text-muted-foreground mx-auto mb-3 opacity-60" />
              <p className="text-sm font-medium text-foreground">No comments yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isAuthenticated
                  ? "Be the first to share your thoughts."
                  : "Sign in to join the conversation."}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {comments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </ul>
          )}
        </div>
      </section>
    </AppLayout>
  );
}

function CommentCard({ comment }: { comment: Comment }) {
  const createdAtFriendly =
    comment.createdAt && !Number.isNaN(new Date(comment.createdAt).getTime())
      ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
      : "";

  return (
    <li className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex gap-3">
        <UserAvatar
          name={comment.userDisplayName}
          imageUrl={comment.userProfileImageUrl}
          size="sm"
          className="shrink-0 mt-0.5"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-medium text-foreground text-sm">
              {comment.userDisplayName || "—"}
            </span>
            {createdAtFriendly && (
              <span className="text-xs text-muted-foreground">{createdAtFriendly}</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>
      </div>
    </li>
  );
}
