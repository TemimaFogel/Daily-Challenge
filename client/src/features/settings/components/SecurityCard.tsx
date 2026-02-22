import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SecurityCard() {
  return (
    <Card className="rounded-2xl border border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Security</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          Change password is not available yet. It will appear here when supported by the server.
        </div>
      </CardContent>
    </Card>
  );
}
