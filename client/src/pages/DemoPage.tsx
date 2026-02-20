import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { CardSection } from "@/components/ui/CardSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { LoadingSkeleton, CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DemoPage() {
  return (
    <AppLayout title="Design system demo">
      <PageHeader
        description="Typography, buttons, cards, and reusable blocks. 8px grid, subtle borders, minimal shadows."
      />

      {/* Typography */}
      <CardSection
        title="Typography"
        description="Headings and body text"
        className="mb-6"
      >
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Heading 1</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Use for page titles
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Heading 2
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Section titles
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">Heading 3</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Card or block titles
            </p>
          </div>
          <p className="text-base text-foreground">
            Body text: default size and line height for readable content.
          </p>
          <p className="text-sm text-muted-foreground">
            Muted secondary text for descriptions and captions.
          </p>
        </div>
      </CardSection>

      {/* Buttons */}
      <CardSection
        title="Buttons"
        description="shadcn/ui Button variants"
        className="mb-6"
      >
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </CardSection>

      {/* Cards */}
      <CardSection
        title="Cards"
        description="shadcn/ui Card component"
        className="mb-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Card title</CardTitle>
              <CardDescription>
                Optional short description for the card.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Card content goes here. Rounded corners, subtle border, minimal
                shadow.
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">Action</Button>
              <Button size="sm" variant="outline">
                Cancel
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Another card</CardTitle>
              <CardDescription>Consistent spacing (8px grid).</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All sections use p-4, gap-2, gap-4 for consistent rhythm.
              </p>
            </CardContent>
          </Card>
        </div>
      </CardSection>

      {/* EmptyState & ErrorBanner & LoadingSkeleton */}
      <CardSection
        title="Reusable blocks"
        description="EmptyState, ErrorBanner, LoadingSkeleton"
        className="mb-6"
      >
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              EmptyState
            </p>
            <EmptyState
              title="No items yet"
              description="Create your first challenge to get started."
              action={<Button size="sm">Create challenge</Button>}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              ErrorBanner
            </p>
            <ErrorBanner
              message="Something went wrong. Please try again."
              onDismiss={() => {}}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              LoadingSkeleton (CardSkeleton)
            </p>
            <div className="flex gap-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              LoadingSkeleton (inline)
            </p>
            <LoadingSkeleton className="h-8 w-48" />
          </div>
        </div>
      </CardSection>
    </AppLayout>
  );
}
