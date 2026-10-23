import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { apiClient, queryKeys } from "@shared/api/index.ts";
import type {
  PaginatedList,
  PostDetailsResponse,
  PostStatus,
  PostSummaryResponse,
} from "@shared/types/index.ts";

export interface MyPostsFilters {
  status?: PostStatus | "all";
  pageNumber?: number;
  pageSize?: number;
}

export function useInfiniteProfilePostsQuery(username: string, pageSize = 12) {
  return useInfiniteQuery<PaginatedList<PostSummaryResponse>>({
    queryKey: queryKeys.posts.infiniteByUser(username, { pageSize }),
    queryFn: ({ pageParam = 1 }) =>
      apiClient.getProfilePosts(username, pageParam as number, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined,
    enabled: Boolean(username),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function usePostDetailsQuery(id: string, options?: { enabled?: boolean }) {
  return useQuery<PostDetailsResponse>({
    queryKey: queryKeys.posts.detail(id),
    queryFn: () => apiClient.getPostById(id),
    enabled: options?.enabled ?? Boolean(id),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useMyPostsQuery(filters?: MyPostsFilters) {
  return useQuery<PaginatedList<PostSummaryResponse>>({
    queryKey: queryKeys.posts.mine(filters as Record<string, unknown>),
    queryFn: () =>
      apiClient.getMyPosts(
        filters?.status,
        filters?.pageNumber ?? 1,
        filters?.pageSize ?? 10
      ),
    staleTime: 1000 * 30, // 30 seconds
  });
}
