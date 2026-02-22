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
import { useCreateGroup } from "../hooks/useCreateGroup";
import { InviteMembersPicker } from "./InviteMembersPicker";
import type { UserSearchResult } from "../api/users.api";

export interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called on success with the message to show (e.g. for toast). */
  onSuccess?: (message: string) => void;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateGroupDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const [manualEmails, setManualEmails] = useState<string[]>([]);
  const [nameError, setNameError] = useState<string | null>(null);

  const create = useCreateGroup();

  const inviteEmails = [
    ...selectedUsers.map((u) => u.email),
    ...manualEmails,
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Group name is required.");
      return;
    }
    create.mutate(
      {
        name: trimmedName,
        description: description.trim() || null,
        inviteEmails,
      },
      {
        onSuccess: (data) => {
          const message =
            data.failed > 0
              ? `Group created. Some invites failed (${data.failed}/${inviteEmails.length}).`
              : inviteEmails.length > 0
                ? "Group created and invites sent."
                : "Group created.";
          onSuccess?.(message);
          resetAndClose();
        },
      }
    );
  };

  const resetAndClose = () => {
    setName("");
    setDescription("");
    setSelectedUsers([]);
    setManualEmails([]);
    setNameError(null);
    create.reset();
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setName("");
      setDescription("");
      setSelectedUsers([]);
      setManualEmails([]);
      setNameError(null);
      create.reset();
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <form
          onSubmit={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="group-name" className="text-sm font-medium">
                Group Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="group-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                placeholder="e.g. Weekend Runners"
                maxLength={255}
                required
              />
              {nameError && (
                <p className="text-sm text-destructive">{nameError}</p>
              )}
            </div>
            <div className="grid gap-2">
              <label htmlFor="group-description" className="text-sm font-medium">
                Description <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="group-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this group about?"
                maxLength={1000}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <InviteMembersPicker
              selectedUsers={selectedUsers}
              onSelectedUsersChange={setSelectedUsers}
              manualEmails={manualEmails}
              onManualEmailsChange={setManualEmails}
            />

            {create.isError && (
              <p className="text-sm text-destructive">
                Failed to create group. Please try again.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={create.isPending || !name.trim()}
              onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            >
              {create.isPending ? "Creating…" : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
