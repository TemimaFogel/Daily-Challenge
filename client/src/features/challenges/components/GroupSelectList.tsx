import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { useMyGroups } from "@/features/groups/hooks/useMyGroups";
import type { GroupSummary } from "@/features/groups/api/groups.api";
import { cn } from "@/lib/utils";

export interface GroupSelectListProps {
  value: string | null;
  onChange: (groupId: string | null) => void;
  placeholder?: string;
  className?: string;
}

export function GroupSelectList({
  value,
  onChange,
  placeholder = "Select a group...",
  className,
}: GroupSelectListProps) {
  const [search, setSearch] = useState("");
  const { data: groups = [], isLoading } = useMyGroups();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) =>
      (g.name ?? "").toLowerCase().includes(q)
    );
  }, [groups, search]);

  return (
    <div className={cn("space-y-2", className)}>
      <Input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
        className="w-full"
      />
      <div className="rounded-lg border border-border bg-muted/30 max-h-48 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            Loading groups…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            {groups.length === 0 ? "No groups yet." : "No groups match your search."}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((group) => (
              <GroupRow
                key={group.id}
                group={group}
                selected={value === group.id}
                onSelect={() => onChange(value === group.id ? null : group.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function GroupRow({
  group,
  selected,
  onSelect,
}: {
  group: GroupSummary;
  selected: boolean;
  onSelect: () => void;
}) {
  const name = group.name?.trim() ?? "—";
  const count = typeof group.memberCount === "number" ? group.memberCount : 0;

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-none hover:bg-muted/60 transition-colors",
          selected && "bg-primary/10"
        )}
      >
        <span className="text-lg shrink-0" aria-hidden>
          👥
        </span>
        <span className="flex-1 min-w-0 font-medium text-foreground truncate">
          {name}
        </span>
        <span className="text-xs text-muted-foreground shrink-0">
          {count} Member{count !== 1 ? "s" : ""}
        </span>
        <span
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded border",
            selected
              ? "bg-primary border-primary"
              : "border-input bg-background"
          )}
          aria-hidden
        >
          {selected && (
            <svg className="size-2.5 text-primary-foreground" fill="currentColor" viewBox="0 0 12 12">
              <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
            </svg>
          )}
        </span>
      </button>
    </li>
  );
}
