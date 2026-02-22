import { cn } from "@/lib/utils";
import type { Visibility } from "../types";

interface ChallengeFiltersProps {
  visibility?: Visibility;
  onVisibilityChange: (v: Visibility | undefined) => void;
  className?: string;
}

const TABS: { value: Visibility | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PUBLIC", label: "Public" },
  { value: "GROUP", label: "Group" },
  { value: "PERSONAL", label: "Personal" },
];

export function ChallengeFilters({
  visibility,
  onVisibilityChange,
  className,
}: ChallengeFiltersProps) {
  const active = visibility ?? "ALL";

  return (
    <div className={cn("flex flex-wrap items-center gap-2 border-b border-border", className)}>
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() =>
            onVisibilityChange(tab.value === "ALL" ? undefined : tab.value)
          }
          className={cn(
            "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
            (active === tab.value || (tab.value === "ALL" && !visibility))
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
