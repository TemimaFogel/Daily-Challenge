import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface DangerZoneCardProps {
  onLogout: () => void;
}

export function DangerZoneCard({ onLogout }: DangerZoneCardProps) {
  return (
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
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border px-4 py-3 opacity-75">
          <div>
            <p className="font-medium text-foreground">Delete account</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all data. This cannot be undone.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Not available yet
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
