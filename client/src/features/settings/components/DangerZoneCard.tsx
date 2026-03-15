import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { deleteCurrentUser } from "@/api/user.api";

export interface DangerZoneCardProps {
  onLogout: () => void;
}

export function DangerZoneCard({ onLogout }: DangerZoneCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteCurrentUser();
      setDeleteDialogOpen(false);
      onLogout();
    } catch {
      setDeleteError("Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card className="rounded-2xl border border-border shadow-sm border-destructive/30">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
            <div>
              <p className="font-medium text-foreground">Log out from this device</p>
              <p className="text-sm text-muted-foreground">
                End your session here. You can sign in again anytime.
              </p>
            </div>
            <Button type="button" variant="destructive" onClick={onLogout}>
              Log out
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
            <div>
              <p className="font-medium text-foreground">Delete account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account. You will not be able to log in again. This cannot be undone.
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete account
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete account</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete your account? You will not be able to log in again. This action cannot be undone.
          </p>
          {deleteError && (
            <p className="text-sm text-destructive">{deleteError}</p>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Yes, delete my account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
