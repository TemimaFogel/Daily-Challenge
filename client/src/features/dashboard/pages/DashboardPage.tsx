import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  SoftCard,
  LeftSidebarCard,
  UserAvatar,
} from "@/components/design";
import { CreateChallengeCard } from "../components/CreateChallengeCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePersonalDashboard } from "@/features/challenges/hooks/useChallenges";
import { useCurrentUser, getDisplayName } from "@/hooks/useCurrentUser";
import { useTodayTopChallenge } from "../hooks/useTodayTopChallenge";
import { getTodayLocal } from "@/features/challenges/lib/dateUtils";
import { DashboardChallengeCard } from "../components/DashboardChallengeCard";
import { HeroIllustration } from "../components/HeroIllustration";
import { Filter, Trophy } from "lucide-react";
import type { PersonalDashboardItemDTO } from "@/api/dashboard.api";

function KpiSkeleton() {
  return (
    <SoftCard>
      <LoadingSkeleton className="h-4 w-2/3 mb-2" />
      <LoadingSkeleton className="h-8 w-1/2" />
    </SoftCard>
  );
}

function ActivityItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <SoftCard className="shrink-0 w-[min(100%,280px)] transition-transform hover:scale-[1.02]">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground [&_svg]:size-5 shrink-0">{icon}</div>
        <p className="text-sm text-foreground line-clamp-2">{text}</p>
      </div>
    </SoftCard>
  );
}

function ChartIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function UserJoinIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  );
}

export function DashboardPage() {
  const { data: dashboard, isLoading } = usePersonalDashboard();
  const { data: currentUser } = useCurrentUser();

  const displayName = getDisplayName(currentUser?.name ?? null, currentUser?.email ?? null);

  const challenges = dashboard?.challenges ?? [];
  const totalCompleted = dashboard?.totalCompletions ?? 0;
  const streak = dashboard?.streak ?? 0;
  const activeCount = dashboard?.activeDailyChallenges ?? challenges.length;
  const completedTodayCount = challenges.filter((c) => c.completedToday).length;
  const completionRate = activeCount > 0 ? Math.round((completedTodayCount / activeCount) * 100) : null;

  const todayLocal = getTodayLocal(currentUser?.timezone ?? undefined);
  const { challenge: todayTopChallenge, isLoading: todayTopLoading } = useTodayTopChallenge(todayLocal);

  const recentActivity = ((): Array<{ icon: React.ReactNode; text: string }> => {
    const items: Array<{ icon: React.ReactNode; text: string }> = [];
    const completed = challenges.filter((c) => c.completedToday);
    const notCompleted = challenges.filter((c) => !c.completedToday);
    completed.forEach((item) => {
      const title = item.challenge?.title ?? (item.challenge?.description ?? "").split(/\n/)[0]?.slice(0, 40) ?? "Challenge";
      items.push({ icon: <CheckIcon />, text: `You completed "${title}" challenge` });
    });
    notCompleted.slice(0, 3 - items.length).forEach((item) => {
      const title = item.challenge?.title ?? (item.challenge?.description ?? "").split(/\n/)[0]?.slice(0, 40) ?? "Challenge";
      items.push({ icon: <UserJoinIcon />, text: `Your active challenge: "${title}"` });
    });
    return items.slice(0, 6);
  })();

  const leftSidebar = (
    <div className="space-y-4">
      <LeftSidebarCard title="Filter" headerVariant="secondary" icon={<Filter className="size-5" />}>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <select className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option>All</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">By user</label>
            <input
              type="text"
              placeholder="Type username..."
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </LeftSidebarCard>
      <LeftSidebarCard title="Profile" headerVariant="primary">
        <div className="flex flex-col items-center gap-2">
          <UserAvatar name={displayName} imageUrl={currentUser?.profileImageUrl} size="lg" />
          <p className="font-medium text-foreground">{displayName}</p>
        </div>
      </LeftSidebarCard>
      <LeftSidebarCard title="Top Users" headerVariant="primary" icon={<Trophy className="size-5" />}>
        <p className="text-sm text-muted-foreground">Coming soon</p>
      </LeftSidebarCard>
    </div>
  );

  const rightSidebar = <CreateChallengeCard />;

  const mainContent = (
    <div className="space-y-8">
      <SoftCard largeRadius className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 dark:from-primary/15 dark:via-secondary/10 dark:to-accent/15 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Achieve more together.</h1>
            <p className="text-muted-foreground mt-1.5">Welcome back, {displayName}! Your daily growth journey starts here.</p>
          </div>
          <div className="flex justify-end shrink-0">
            <HeroIllustration />
          </div>
        </div>
      </SoftCard>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              <KpiSkeleton />
              <KpiSkeleton />
              <KpiSkeleton />
              <KpiSkeleton />
            </>
          ) : (
            <>
              <SoftCard className="relative transition-transform hover:scale-[1.02]">
                <div className="absolute top-4 right-4 text-primary/40 [&_svg]:size-5">
                  <ChartIcon />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Completed Challenges</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalCompleted}</p>
              </SoftCard>
              <SoftCard className="relative transition-transform hover:scale-[1.02]">
                <div className="absolute top-4 right-4 text-accent [&_svg]:size-5">
                  <ChartIcon />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-foreground mt-1">{streak} {streak === 1 ? "day" : "days"}</p>
              </SoftCard>
              <SoftCard className="relative transition-transform hover:scale-[1.02]">
                <div className="absolute top-4 right-4 text-secondary [&_svg]:size-5">
                  <ChartIcon />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-foreground mt-1">{completionRate != null ? `${completionRate}%` : "—"}</p>
              </SoftCard>
              <SoftCard className="lg:col-span-1 flex flex-col gap-3 transition-transform hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Today&apos;s Challenge Preview</p>
                  <div className="text-muted-foreground [&_svg]:size-5">
                    <ClockIcon />
                  </div>
                </div>
                {todayTopLoading ? (
                  <>
                    <LoadingSkeleton className="h-1.5 w-full rounded-full" />
                    <LoadingSkeleton className="h-5 w-3/4 mt-2" />
                    <LoadingSkeleton className="h-9 w-full mt-2" />
                  </>
                ) : todayTopChallenge ? (
                  <>
                    <div className="flex-1 min-h-0">
                      <p className="font-semibold text-foreground line-clamp-2">{todayTopChallenge.title || "—"}</p>
                      <p className="text-xs text-muted-foreground mt-1">Most popular today</p>
                    </div>
                    <Link to={`/challenges/${todayTopChallenge.id}`} className={cn(buttonVariants(), "inline-flex rounded-full")}>
                      Open Challenge
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground text-sm">No active challenge</p>
                    <Link to="/challenges" className={cn(buttonVariants({ variant: "outline" }), "inline-flex rounded-full")}>
                      Browse Challenges
                    </Link>
                  </>
                )}
              </SoftCard>
            </>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-foreground mb-4">Your Active Challenges</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LoadingSkeleton className="h-32 rounded-2xl" />
            <LoadingSkeleton className="h-32 rounded-2xl" />
          </div>
        ) : challenges.length === 0 ? (
          <EmptyState
            title="No active challenges"
            description="Join a challenge to see it here."
            action={<Link to="/challenges" className={cn(buttonVariants(), "inline-flex rounded-full")}>Browse Challenges</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((item: PersonalDashboardItemDTO) => (
              <DashboardChallengeCard key={item.challenge?.id ?? ""} challenge={item.challenge ?? {}} completedToday={item.completedToday} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-base font-semibold text-foreground mb-4">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <EmptyState title="No activity yet" description="Complete or join challenges to see your activity here." />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            {recentActivity.map((item, i) => (
              <ActivityItem key={i} icon={item.icon} text={item.text} />
            ))}
          </div>
        )}
      </section>
    </div>
  );

  return (
    <AppLayout fullWidth>
      <DashboardLayout leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
        {mainContent}
      </DashboardLayout>
    </AppLayout>
  );
}
