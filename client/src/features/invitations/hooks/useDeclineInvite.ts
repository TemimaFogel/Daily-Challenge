import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invitationsApi } from "../api/invitations.api";
import { INVITES_QUERY_KEY } from "./useInvites";

const GROUPS_MY_KEY = ["groups", "my"] as const;

export function useDeclineInvite(options?: {
  onSuccess?: (data: Awaited<ReturnType<typeof invitationsApi.decline>>, id: string) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invitationsApi.decline(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: INVITES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: GROUPS_MY_KEY });
      options?.onSuccess?.(data, id);
    },
    onError: options?.onError,
  });
}
