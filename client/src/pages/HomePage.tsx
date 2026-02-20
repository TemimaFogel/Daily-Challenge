import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { CardSection } from "@/components/ui/CardSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <AppLayout title="Dashboard">
      <PageHeader
        description="Your daily challenges at a glance."
      />
      <CardSection title="Welcome" description="Daily Challenge app">
        <EmptyState
          title="No challenges yet"
          description="Create a challenge or join one to start tracking your progress."
          action={
            <Link to="/demo" className={cn(buttonVariants())}>
              View design demo
            </Link>
          }
        />
      </CardSection>
    </AppLayout>
  );
}
