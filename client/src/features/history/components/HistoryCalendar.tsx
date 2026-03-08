import {
  addDays,
  addMonths,
  subMonths,
  endOfMonth,
  format,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HistoryMonthData } from "../lib/historyMapper";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type HistoryFilterType = "all" | "joined" | "completed";

export interface HistoryCalendarProps {
  monthDate: Date;
  onMonthChange: (date: Date) => void;
  selectedDate: string | null;
  onSelectDate: (dateStr: string | null) => void;
  data: HistoryMonthData | undefined;
  filter?: HistoryFilterType;
  className?: string;
}

export function HistoryCalendar({
  monthDate,
  onMonthChange,
  selectedDate,
  onSelectDate,
  data,
  filter = "all",
  className,
}: HistoryCalendarProps) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days: Date[] = [];
  for (let d = new Date(calStart); d <= calEnd; d = addDays(d, 1)) {
    days.push(new Date(d));
  }

  const handlePrev = () => {
    onMonthChange(startOfMonth(subMonths(monthDate, 1)));
  };
  const handleNext = () => {
    onMonthChange(startOfMonth(addMonths(monthDate, 1)));
  };

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrev}
          className="flex size-9 items-center justify-center rounded-lg border border-input bg-background hover:bg-muted transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {format(monthDate, "MMMM yyyy")}
        </span>
        <button
          type="button"
          onClick={handleNext}
          className="flex size-9 items-center justify-center rounded-lg border border-input bg-background hover:bg-muted transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-1 text-center text-[0.65rem] font-medium text-muted-foreground uppercase tracking-wider"
          >
            {label}
          </div>
        ))}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const summary = data?.summaryByDate[dateStr];
          const joined = summary?.joinedCount ?? 0;
          const completed = summary?.completedCount ?? 0;
          const showJoined = (filter === "all" || filter === "joined") && joined > 0;
          const showCompleted = (filter === "all" || filter === "completed") && completed > 0;
          const isCurrentMonth = day.getMonth() === monthDate.getMonth();
          const isSelected = selectedDate === dateStr;
          const isTodayDate = isToday(day);

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
              className={cn(
                "min-h-[52px] flex flex-col items-center justify-center rounded-lg text-sm transition-colors",
                !isCurrentMonth && "text-muted-foreground/60",
                isCurrentMonth && "text-foreground",
                isSelected && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
                !isSelected && isTodayDate && "bg-accent text-accent-foreground",
                !isSelected && !isTodayDate && isCurrentMonth && "hover:bg-muted/70"
              )}
            >
              <span className="font-medium">{format(day, "d")}</span>
              <div className="flex items-center gap-0.5 mt-0.5 flex-wrap justify-center max-w-full">
                {showJoined && (
                  <span
                    className={cn(
                      "inline-flex items-center rounded px-1 text-[10px] font-medium",
                      isSelected ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"
                    )}
                    title={`${joined} joined`}
                  >
                    {joined}
                  </span>
                )}
                {showCompleted && (
                  <span
                    className={cn(
                      "inline-flex items-center rounded px-1 text-[10px] font-medium bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
                      isSelected && "bg-primary-foreground/20 text-primary-foreground"
                    )}
                    title={`${completed} completed`}
                  >
                    {completed}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
