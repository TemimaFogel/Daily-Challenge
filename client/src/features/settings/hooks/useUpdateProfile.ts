import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authStore } from "@/auth/authStore";
import { updateCurrentUser } from "@/api/user.api";
import type { UpdateUserRequest } from "@/api/user.api";
import { getMeQueryKey } from "./useMe";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const userId = authStore.getCurrentUserId();

  return useMutation({
    mutationFn: (body: UpdateUserRequest) => updateCurrentUser(body),
    onSuccess: (data) => {
      if (data && userId) {
        queryClient.setQueryData(getMeQueryKey(userId), data);
        queryClient.invalidateQueries({ queryKey: ["me", userId] });
        queryClient.invalidateQueries({ queryKey: ["currentUser", userId] });
        const user = authStore.getCurrentUser();
        if (user) {
          authStore.setCurrentUser({
            id: user.id,
            email: data.email ?? user.email,
            name: data.name ?? undefined,
          });
        }
      }
    },
  });
}
