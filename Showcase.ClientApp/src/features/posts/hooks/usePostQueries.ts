import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, extractApiErrorMessage, queryKeys } from "@shared/api/index.ts";
import type {
  CreatePostRequest,
  ExplorePostResponse,
  PaginatedList,
  PostDetailsResponse,
  PostStatus,
  PostSummaryResponse,
  UpdatePostRequest,
} from "@shared/types/index.ts";

export interface ExploreFilters {
  search?: string;
  category?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface MyPostsFilters {
  status?: PostStatus | "all";
  pageNumber?: number;
  pageSize?: number;
}

export function useExplorePostsQuery(filters?: ExploreFilters) {
  return useQuery<PaginatedList<ExplorePostResponse>>({
    queryKey: queryKeys.posts.explore(filters as Record<string, unknown>),
    queryFn: () =>
      apiClient.getExplorePosts(
        filters?.search,
        filters?.pageNumber ?? 1,
        filters?.pageSize ?? 12,
        filters?.category
      ),
    staleTime: 1000 * 60, // 1 minute
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

export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostRequest) => apiClient.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      toast.success("Draft created successfully!");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to create post."));
    },
  });
}

export function useUpdatePostMutation(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePostRequest) => apiClient.updatePost(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      toast.success("Post updated successfully!");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to update post."));
    },
  });
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => apiClient.deletePost(postId),
    onSuccess: (_data, postId) => {
      queryClient.removeQueries({ queryKey: queryKeys.posts.detail(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      toast.success("Post deleted successfully.");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to delete post."));
    },
  });
}

export function usePublishPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => apiClient.publishPost(postId),
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      toast.success("Post published successfully!");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to publish post."));
    },
  });
}

export function useUnpublishPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => apiClient.unpublishPost(postId),
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      toast.info("Post unpublished and returned to draft.");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to unpublish post."));
    },
  });
}

export function useToggleLikeMutation(postId: string) {
  const queryClient = useQueryClient();
  const detailKey = queryKeys.posts.detail(postId);

  return useMutation({
    mutationFn: () => apiClient.toggleLikePost(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previousPost = queryClient.getQueryData<PostDetailsResponse>(detailKey);

      if (previousPost) {
        const nextIsLiked = !previousPost.isLiked;
        const nextLikeCount = (previousPost.likeCount ?? 0) + (nextIsLiked ? 1 : -1);

        queryClient.setQueryData<PostDetailsResponse>(detailKey, {
          ...previousPost,
          isLiked: nextIsLiked,
          likeCount: Math.max(0, nextLikeCount),
        });
      }

      return { previousPost };
    },
    onError: (err, _variables, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(detailKey, context.previousPost);
      }
      toast.error(extractApiErrorMessage(err, "Failed to update like status."));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: detailKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}
