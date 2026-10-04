import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient, queryKeys } from "@shared/api/index.ts";
import { useToast } from "@shared/context/index.ts";
import { isPostPublished } from "../utils.ts";
import { PostStatus, type PostSummaryResponse } from "@shared/types/index.ts";

export interface UsePostActionsProps {
  posts: PostSummaryResponse[];
  setPosts: React.Dispatch<React.SetStateAction<PostSummaryResponse[]>>;
}

export function usePostActions({ setPosts }: UsePostActionsProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<PostSummaryResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleTogglePublish = async (post: PostSummaryResponse) => {
    const isCurrentlyPublished = isPostPublished(post.status);

    if (isCurrentlyPublished) {
      setActionInProgressId(post.id);
      try {
        await apiClient.unpublishPost(post.id);
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, status: PostStatus.Unpublished } : p))
        );
        showToast("success", `"${post.title}" moved to Unpublished.`);
        queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      } catch (err) {
        console.error("Failed to unpublish post:", err);
        showToast("error", "Failed to unpublish post.");
      } finally {
        setActionInProgressId(null);
      }
    } else {
      if (!post.imageCount || post.imageCount < 1) {
        showToast(
          "warning",
          'A project must have at least one image before publishing. Click "Edit" to add images.'
        );
        return;
      }

      setActionInProgressId(post.id);
      try {
        await apiClient.publishPost(post.id);
        const now = new Date().toISOString();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? { ...p, status: PostStatus.Published, publishedAt: p.publishedAt || now }
              : p
          )
        );
        showToast("success", `"${post.title}" is now published.`);
        queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      } catch (err) {
        console.error("Failed to publish post:", err);
        showToast("error", "Failed to publish post. Please check your connection and try again.");
      } finally {
        setActionInProgressId(null);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await apiClient.deletePost(postToDelete.id);
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
      showToast("success", `"${postToDelete.title}" deleted.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      setPostToDelete(null);
    } catch (err) {
      console.error("Failed to delete post:", err);
      showToast("error", "Failed to delete post.");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    actionInProgressId,
    postToDelete,
    setPostToDelete,
    isDeleting,
    handleTogglePublish,
    handleConfirmDelete,
  };
}
