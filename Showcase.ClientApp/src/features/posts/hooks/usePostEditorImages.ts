import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@shared/api/apiClient.ts";
import { queryKeys } from "@shared/api/queryKeys.ts";
import { PostStatus } from "@shared/types/index.ts";
import type { UploadedImageData } from "../components/ImageDropzone.tsx";
import type { ImageGridItem } from "../components/ImageReorderGrid.tsx";
import {
  clearDraftImagesFromLocal,
  loadDraftImagesFromLocal,
  saveDraftImagesToLocal,
} from "../utils/postDraftStorage.ts";

export interface UsePostEditorImagesOptions {
  id?: string;
  postStatus: number;
  setIsDirty: (dirty: boolean) => void;
}

export function usePostEditorImages({
  id,
  postStatus,
  setIsDirty,
}: UsePostEditorImagesOptions) {
  const queryClient = useQueryClient();
  const [images, setImages] = useState<ImageGridItem[]>([]);
  const [imageInvariantError, setImageInvariantError] = useState<string | null>(null);
  const stagedBlobUrlsRef = useRef<Set<string>>(new Set());

  // Memory leak protection: Revoke all remaining local staged blob URLs on unmount
  useEffect(() => {
    const urls = stagedBlobUrlsRef.current;
    return () => {
      urls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      urls.clear();
    };
  }, []);

  // Restore local draft images if creating a new post
  useEffect(() => {
    if (!id) {
      let isSubscribed = true;
      void (async () => {
        const stored = await loadDraftImagesFromLocal();
        if (isSubscribed && stored && stored.length > 0) {
          const restored: ImageGridItem[] = stored.map((item, idx) => {
            const url = URL.createObjectURL(item.file);
            stagedBlobUrlsRef.current.add(url);
            return {
              id: item.id,
              url,
              storageKey: `posts/staged/${item.id}`,
              displayOrder: item.displayOrder ?? idx,
              file: item.file,
            };
          });
          setImages(restored);
        }
      })();
      return () => {
        isSubscribed = false;
      };
    }
  }, [id]);

  // Persist local staged images whenever they change for new posts
  useEffect(() => {
    if (!id) {
      if (images.length > 0) {
        const records = images
          .filter((img) => img.file)
          .map((img) => ({
            id: img.id,
            file: img.file as File,
            displayOrder: img.displayOrder,
          }));
        void saveDraftImagesToLocal(records);
      } else {
        void clearDraftImagesFromLocal();
      }
    }
  }, [id, images]);

  const handleImagesUploaded = (newImages: UploadedImageData[]) => {
    setImageInvariantError(null);
    setIsDirty(true);
    newImages.forEach((img) => {
      if (img.url && img.url.startsWith("blob:")) {
        stagedBlobUrlsRef.current.add(img.url);
      }
    });
    setImages((prev) => {
      const startOrder = prev.length;
      const formatted: ImageGridItem[] = newImages.map((img, index) => ({
        id: img.id || `img_${Date.now()}_${index}`,
        url: img.url,
        storageKey: img.storageKey,
        displayOrder: startOrder + index,
        file: img.file,
      }));
      return [...prev, ...formatted];
    });
  };

  const handleReorderImages = async (reordered: ImageGridItem[]) => {
    setImages(reordered);
    setIsDirty(true);
    if (id) {
      try {
        await apiClient.reorderPostImages(id, {
          items: reordered.map((img) => ({ id: img.id, displayOrder: img.displayOrder })),
        });
        await queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      } catch (err) {
        console.error("Failed to synchronize image reorder:", err);
      }
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (postStatus === PostStatus.Published && images.length <= 1) {
      setImageInvariantError(
        "Published works must retain at least one image. Unpublish the post before removing this image."
      );
      return;
    }
    setImageInvariantError(null);
    setIsDirty(true);

    if (id) {
      try {
        await apiClient.removePostImage(id, imageId);
        await queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      } catch (err) {
        console.error("Failed to remove image from storage:", err);
        toast.error("Failed to remove image from backend.");
        return;
      }
    }

    setImages((prev) => {
      const target = prev.find((img) => img.id === imageId);
      if (target?.url && target.url.startsWith("blob:")) {
        URL.revokeObjectURL(target.url);
        stagedBlobUrlsRef.current.delete(target.url);
      }
      const remaining = prev.filter((img) => img.id !== imageId);
      return remaining.map((img, idx) => ({ ...img, displayOrder: idx }));
    });
  };

  const handleSetCoverImage = async (imageId: string) => {
    setImageInvariantError(null);
    setIsDirty(true);

    const target = images.find((img) => img.id === imageId);
    if (!target) return;
    const others = images.filter((img) => img.id !== imageId);
    const reorderedList = [target, ...others].map((img, idx) => ({ ...img, displayOrder: idx }));

    setImages(reorderedList);

    if (id && reorderedList.length > 0) {
      try {
        await apiClient.reorderPostImages(id, {
          items: reorderedList.map((img) => ({ id: img.id, displayOrder: img.displayOrder })),
        });
        await queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
        toast.success("Cover image updated successfully.");
      } catch (err) {
        console.error("Failed to synchronize cover image update:", err);
        toast.error("Failed to update cover image.");
      }
    }
  };

  return {
    images,
    setImages,
    imageInvariantError,
    setImageInvariantError,
    handleImagesUploaded,
    handleReorderImages,
    handleSetCoverImage,
    handleDeleteImage,
  };
}
