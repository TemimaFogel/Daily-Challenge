import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "../api/users.api";

const DEBOUNCE_MS = 280;

export function useUserSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const searchQuery = useQuery({
    queryKey: ["users", "search", debouncedQuery],
    queryFn: () => usersApi.search(debouncedQuery),
    enabled: debouncedQuery.length >= 1,
    staleTime: 30_000,
  });

  const results = debouncedQuery.length >= 1 ? (searchQuery.data ?? []) : [];

  return useMemo(
    () => ({
      query,
      setQuery,
      debouncedQuery,
      results,
      isLoading: searchQuery.isLoading,
      isFetching: searchQuery.isFetching,
      error: searchQuery.error,
    }),
    [
      query,
      debouncedQuery,
      results,
      searchQuery.isLoading,
      searchQuery.isFetching,
      searchQuery.error,
    ]
  );
}
