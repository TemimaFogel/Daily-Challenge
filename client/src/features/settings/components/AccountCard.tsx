import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export interface AccountCardProps {
  email: string;
}

export function AccountCard({ email }: AccountCardProps) {
  return (
    <Card className="rounded-2xl border border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="settings-email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            id="settings-email"
            type="email"
            value={email}
            readOnly
            className="max-w-md bg-muted/50 cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed here. Contact support if you need to update it.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
