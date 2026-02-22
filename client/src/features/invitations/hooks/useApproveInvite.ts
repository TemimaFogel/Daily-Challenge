import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invitationsApi } from "../api/invitations.api";
import { INVITES_QUERY_KEY } from "./useInvites";

const GROUPS_MY_KEY = ["groups", "my"] as const;

export function useApproveInvite(options?: {
  onSuccess?: (data: Awaited<ReturnType<typeof invitationsApi.approve>>) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invitationsApi.approve(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: INVITES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: GROUPS_MY_KEY });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}
