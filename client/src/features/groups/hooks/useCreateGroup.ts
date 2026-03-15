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
      let invited = 0;
      let failed = 0;
      for (const email of inviteEmails) {
        try {
          await groupsApi.createInvite(group.id, { email });
          invited++;
        } catch (err: unknown) {
          const ax = err as { response?: { status?: number; data?: { code?: string } } };
          if (
            ax?.response?.status === 404 &&
            ax?.response?.data?.code === "USER_NOT_FOUND"
          ) {
            try {
              await groupsApi.createExternalInvite(group.id, { email });
              invited++;
            } catch {
              failed++;
            }
          } else {
            failed++;
          }
        }
      }
      return { group, invited, failed };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_GROUPS_KEY });
    },
  });
}
