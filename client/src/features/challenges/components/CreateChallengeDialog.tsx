import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { GroupSelectList } from "./GroupSelectList";
import { useCreateChallenge } from "../hooks/useChallenges";
import type { Visibility } from "../types";
import { cn } from "@/lib/utils";

export interface CreateChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called on success with the message to show (e.g. for toast). */
  onSuccess?: (message: string) => void;
}

type AssignTo = "PERSONAL" | "GROUP" | "PUBLIC";

const ASSIGN_OPTIONS: { value: AssignTo; label: string }[] = [
  { value: "PERSONAL", label: "Personal (Just for me)" },
  { value: "GROUP", label: "Group (Assign to a group)" },
  { value: "PUBLIC", label: "Public (Open to everyone)" },
];

export function CreateChallengeDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateChallengeDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [assignTo, setAssignTo] = useState<AssignTo | "">("");
  const [groupId, setGroupId] = useState<string | null>(null);

  const create = useCreateChallenge();

  const visibility: Visibility | null =
    assignTo === "" ? null : (assignTo as Visibility);

  const canSubmit =
    name.trim() !== "" &&
    visibility !== null &&
    (visibility !== "GROUP" || (groupId != null && groupId.trim() !== ""));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !visibility) return;
    const title = name.trim();
    const desc = description.trim();
    create.mutate(
      {
        title,
        description: desc !== "" ? desc : "—",
        visibility,
        groupId: visibility === "GROUP" && groupId ? groupId : undefined,
      },
      {
        onSuccess: () => {
          onSuccess?.("Challenge created");
          resetAndClose();
        },
      }
    );
  };

  const resetAndClose = () => {
    setName("");
    setDescription("");
    setAssignTo("");
    setGroupId(null);
    create.reset();
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetAndClose();
    else create.reset();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Challenge</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="challenge-name" className="text-sm font-medium mb-1.5 block">
              Challenge Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="challenge-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 30-day running streak"
              maxLength={120}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="challenge-desc" className="text-sm font-medium mb-1.5 block">
              Description <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="challenge-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the challenge..."
              maxLength={500}
              rows={3}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y min-h-[80px]"
            />
          </div>

          <div>
            <span className="text-sm font-medium mb-2 block">
              Assign To <span className="text-destructive">*</span>
            </span>
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Assign to">
              {ASSIGN_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-input px-3 py-2.5 cursor-pointer transition-colors hover:bg-muted/50",
                    assignTo === opt.value && "border-primary bg-primary/5"
                  )}
                >
                  <input
                    type="radio"
                    name="assignTo"
                    value={opt.value}
                    checked={assignTo === opt.value}
                    onChange={() => setAssignTo(opt.value)}
                    className="size-4 text-primary border-input"
                  />
                  <span className="text-sm font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {assignTo === "GROUP" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Select a group
              </label>
              <GroupSelectList
                value={groupId}
                onChange={setGroupId}
                placeholder="Select a group..."
              />
            </div>
          )}

          {create.isError && (
            <ErrorBanner
              message={
                typeof create.error === "object" &&
                create.error !== null &&
                "message" in create.error
                  ? String((create.error as { message: string }).message)
                  : "Failed to create challenge. Please try again."
              }
              onDismiss={() => create.reset()}
            />
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || create.isPending}>
              {create.isPending ? "Creating…" : "Create Challenge"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
