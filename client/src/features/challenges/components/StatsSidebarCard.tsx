import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatsSidebarCardProps {
  title: string;
  value: ReactNode;
  description?: string;
  className?: string;
}

export function StatsSidebarCard({
  title,
  value,
  description,
  className,
}: StatsSidebarCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
