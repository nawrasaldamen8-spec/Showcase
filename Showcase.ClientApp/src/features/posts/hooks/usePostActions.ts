import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, extractApiErrorMessage, queryKeys } from "@shared/api/index.ts";
import { isPostPublished } from "../utils.ts";
import type { PostSummaryResponse } from "@shared/types/index.ts";

export interface UsePostActionsProps {
  onActionSuccess?: () => void;
}

export function usePostActions(props?: UsePostActionsProps) {
  const queryClient = useQueryClient();
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<PostSummaryResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleTogglePublish = async (post: PostSummaryResponse) => {
    const isCurrentlyPublished = isPostPublished(post.status);

    if (isCurrentlyPublished) {
      setActionInProgressId(post.id);
      try {
        await apiClient.unpublishPost(post.id);
        toast.success(`"${post.title}" moved to Unpublished.`);
        await queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
        props?.onActionSuccess?.();
      } catch (err) {
        console.error("Failed to unpublish post:", err);
        toast.error(extractApiErrorMessage(err, "Failed to unpublish post."));
      } finally {
        setActionInProgressId(null);
      }
    } else {
      if (!post.imageCount || post.imageCount < 1) {
        toast.warning(
          'A project must have at least one image before publishing. Click "Edit" to add images.'
        );
        return;
      }

      setActionInProgressId(post.id);
      try {
        await apiClient.publishPost(post.id);
        toast.success(`"${post.title}" is now published.`);
        await queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
        props?.onActionSuccess?.();
      } catch (err) {
        console.error("Failed to publish post:", err);
        toast.error(
          extractApiErrorMessage(err, "Failed to publish post. Please check your connection and try again.")
        );
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
      toast.success(`"${postToDelete.title}" deleted.`);
      await queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      props?.onActionSuccess?.();
      setPostToDelete(null);
    } catch (err) {
      console.error("Failed to delete post:", err);
      toast.error(extractApiErrorMessage(err, "Failed to delete post."));
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

