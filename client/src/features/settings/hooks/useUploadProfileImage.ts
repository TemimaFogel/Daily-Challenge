import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authStore } from "@/auth/authStore";
import { uploadProfileImage } from "@/api/user.api";
import { getMeQueryKey } from "./useMe";

export function useUploadProfileImage() {
  const queryClient = useQueryClient();
  const userId = authStore.getCurrentUserId();

  return useMutation({
    mutationFn: (file: File) => uploadProfileImage(file),
    onSuccess: (data, _file) => {
      if (userId != null && data?.profileImageUrl != null) {
        queryClient.invalidateQueries({ queryKey: getMeQueryKey(userId) });
        queryClient.invalidateQueries({ queryKey: ["currentUser", userId] });
      }
    },
  });
}
