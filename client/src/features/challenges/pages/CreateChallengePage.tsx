import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateChallenge, useGroupOptions } from "../hooks/useChallenges";
import type { Visibility } from "../types";

export function CreateChallengePage() {
  const navigate = useNavigate();
  const { data: groupOptions } = useGroupOptions();
  const create = useCreateChallenge();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("PUBLIC");
  const [groupId, setGroupId] = useState<string>("");
  const [challengeDate, setChallengeDate] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        visibility,
        groupId: visibility === "GROUP" && groupId ? groupId : null,
        challengeDate: challengeDate || undefined,
      },
      {
        onSuccess: (data) => {
          navigate(`/challenges/${data.id}`);
        },
      }
    );
  };

  const selectClass =
    "h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <AppLayout title="New challenge">
      <PageHeader
        title="New challenge"
        description="Create a daily challenge for yourself or your group."
      />

      <form onSubmit={handleSubmit}>
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 30-day running streak"
                maxLength={120}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <textarea
                className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the challenge..."
                maxLength={500}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Visibility</label>
              <select
                className={selectClass}
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as Visibility)}
              >
                <option value="PERSONAL">Personal</option>
                <option value="GROUP">Group</option>
                <option value="PUBLIC">Public</option>
              </select>
            </div>
            {visibility === "GROUP" && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Group</label>
                <select
                  className={selectClass}
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  required
                >
                  <option value="">Select a group</option>
                  {groupOptions?.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Challenge date (optional)
              </label>
              <Input
                type="date"
                value={challengeDate}
                onChange={(e) => setChallengeDate(e.target.value)}
              />
            </div>
            {create.isError && (
              <p className="text-sm text-destructive">
                Failed to create challenge. Please try again.
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Creating…" : "Create"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/challenges")}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </AppLayout>
  );
}
