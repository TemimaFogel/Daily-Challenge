import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { format, parseISO, startOfMonth } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { HistoryCalendar } from "../components/HistoryCalendar";
import { DayDetailsPanel } from "../components/DayDetailsPanel";
import { useHistoryMonth } from "../hooks/useHistoryMonth";
import {
  getEntriesForDate,
  getSummaryForDate,
  computeStreak,
} from "../lib/historyMapper";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type FilterType = "all" | "joined" | "completed";

type HistoryLocationState = { selectedDate?: string } | null;

export function HistoryPage() {
  const location = useLocation();
  const locationState = (location.state as HistoryLocationState) ?? null;

  const [monthDate, setMonthDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const dateStr = locationState?.selectedDate;
    if (!dateStr?.trim()) return;
    try {
      const d = parseISO(dateStr);
      setSelectedDate(dateStr);
      setMonthDate(startOfMonth(d));
      setSheetOpen(true);
    } catch {
      // ignore invalid date
    }
  }, [locationState?.selectedDate]);

  const { data, isLoading, isError, refetch } = useHistoryMonth(monthDate);

  const handleMonthChange = (nextMonth: Date) => {
    setMonthDate(nextMonth);
    setSelectedDate(null);
    setSheetOpen(false);
  };

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const monthStats = useMemo(() => {
    if (!data) return { joinedMonth: 0, completedMonth: 0, rate: 0, streak: 0 };
    let joinedMonth = 0;
    let completedMonth = 0;
    for (const s of data.dailySummaries) {
      joinedMonth += s.joinedCount;
      completedMonth += s.completedCount;
    }
    const rate = joinedMonth > 0 ? Math.round((completedMonth / joinedMonth) * 100) : 0;
    const streak = computeStreak(data.dailySummaries, todayStr);
    return { joinedMonth, completedMonth, rate, streak };
  }, [data, todayStr]);

  const entriesForSelected = useMemo(() => {
    if (!selectedDate || !data) return [];
    let list = getEntriesForDate(data, selectedDate);
    if (filter === "joined") list = list.filter((e) => e.joined);
    else if (filter === "completed") list = list.filter((e) => e.completed);
    return list;
  }, [data, selectedDate, filter]);

  const summaryForSelected = selectedDate && data ? getSummaryForDate(data, selectedDate) : null;
  const joinedCount = summaryForSelected?.joinedCount ?? 0;
  const completedCount = summaryForSelected?.completedCount ?? 0;

  const handleSelectDate = (dateStr: string | null) => {
    setSelectedDate(dateStr);
    setSheetOpen(!!dateStr);
  };

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg border border-input bg-background p-0.5">
        <button
          type="button"
          onClick={() => handleMonthChange(startOfMonth(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1)))}
          className="rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Previous month"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={() => handleMonthChange(startOfMonth(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1)))}
          className="rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Next month"
        >
          Next
        </button>
      </div>
      <div className="flex rounded-lg border border-input bg-muted/30 p-0.5">
        {(["all", "joined", "completed"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors",
              filter === f
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <AppLayout>
      <PageHeader
        title="History"
        description="Your progress across time"
        hideTitle
        actions={headerActions}
      />

      {isError && (
        <ErrorBanner
          message="Failed to load history. Please try again."
          onRetry={() => refetch()}
          className="mb-6"
        />
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label="Joined this month"
          value={isLoading ? "—" : String(monthStats.joinedMonth)}
        />
        <SummaryCard
          label="Completed this month"
          value={isLoading ? "—" : String(monthStats.completedMonth)}
        />
        <SummaryCard
          label="Completion rate"
          value={isLoading ? "—" : `${monthStats.rate}%`}
        />
        <SummaryCard
          label="Current streak"
          value={isLoading ? "—" : `${monthStats.streak} day${monthStats.streak !== 1 ? "s" : ""}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {isLoading ? (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-pulse min-h-[340px]" />
          ) : (
            <HistoryCalendar
              monthDate={monthDate}
              onMonthChange={handleMonthChange}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              data={data}
              filter={filter}
            />
          )}
        </div>
        <div className="hidden lg:block">
          {isLoading ? (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-pulse min-h-[280px]" />
          ) : (
            <DayDetailsPanel
              selectedDate={selectedDate}
              entries={entriesForSelected}
              joinedCount={joinedCount}
              completedCount={completedCount}
              filter={filter}
              variant="panel"
            />
          )}
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-md bg-background p-4 overflow-y-auto"
        >
          <DayDetailsPanel
            selectedDate={selectedDate}
            entries={entriesForSelected}
            joinedCount={joinedCount}
            completedCount={completedCount}
            filter={filter}
            onClose={() => setSheetOpen(false)}
            variant="content"
          />
        </SheetContent>
      </Sheet>

      {selectedDate && (
        <div className="mt-4 lg:hidden">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-medium text-foreground shadow-sm hover:bg-muted/50"
          >
            View activity for {selectedDate}
          </button>
        </div>
      )}
    </AppLayout>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
