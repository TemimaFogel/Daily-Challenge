import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "../api/groups.api";

const MY_GROUPS_KEY = ["groups", "my"] as const;

export interface CreateGroupWithInvitesInput {
  name: string;
  description?: string | null;
  inviteEmails: string[];
}

export interface CreateGroupWithInvitesResult {
  group: { id: string; name: string; description?: string | null };
  invited: number;
  failed: number;
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      inviteEmails,
    }: CreateGroupWithInvitesInput): Promise<CreateGroupWithInvitesResult> => {
      const group = await groupsApi.create({
        name,
        description: description ?? null,
      });
      if (inviteEmails.length === 0) {
        return { group, invited: 0, failed: 0 };
      }
      const results = await Promise.allSettled(
        inviteEmails.map((email) => groupsApi.createInvite(group.id, { email }))
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      const invited = results.length - failed;
      return { group, invited, failed };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_GROUPS_KEY });
    },
  });
}
