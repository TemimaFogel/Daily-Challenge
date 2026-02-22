import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CreateGroupCardProps {
  onCreateClick: () => void;
  className?: string;
}

export function CreateGroupCard({ onCreateClick, className }: CreateGroupCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 flex flex-col items-center justify-center min-h-[200px] gap-4",
        className
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Plus className="size-6" />
        </div>
        <span className="font-medium text-foreground">Create New Group</span>
      </div>
      <Button onClick={onCreateClick}>Create Group</Button>
    </div>
  );
}
