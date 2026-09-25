import { useState } from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import { useToast } from "@shared/context/index.ts";
import { PostStatus, type PostSummaryResponse } from "@shared/types/index.ts";

export interface UsePostActionsProps {
  posts: PostSummaryResponse[];
  setPosts: React.Dispatch<React.SetStateAction<PostSummaryResponse[]>>;
}

export function usePostActions({ setPosts }: UsePostActionsProps) {
  const { showToast } = useToast();
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<PostSummaryResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleTogglePublish = async (post: PostSummaryResponse) => {
    const isCurrentlyPublished = Number(post.status) === PostStatus.Published;

    if (isCurrentlyPublished) {
      setActionInProgressId(post.id);
      try {
        await apiClient.unpublishPost(post.id);
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, status: PostStatus.Unpublished } : p))
        );
        showToast("success", `"${post.title}" moved to Unpublished.`);
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
          'Publishing Invariant: A post must have at least one uploaded plate before publishing. Click "Edit" to add artwork.'
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
        showToast("success", `"${post.title}" is now published to the public gallery.`);
      } catch (err) {
        console.error("Failed to publish post:", err);
        showToast("error", "Failed to publish post. Ensure artwork is uploaded.");
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
      showToast("success", `"${postToDelete.title}" permanently removed.`);
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
