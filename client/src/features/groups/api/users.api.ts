import { http } from "@/api/http";

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  profileImageUrl?: string | null;
}

export const usersApi = {
  search(query: string): Promise<UserSearchResult[]> {
    return http
      .get<UserSearchResult[]>("/api/users/search", { params: { query } })
      .then((r) => r.data ?? []);
  },
};
