import { useState } from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import { PostStatus } from "@shared/types/index.ts";
import type { UploadedImageData } from "../components/ImageDropzone.tsx";
import type { ImageGridItem } from "../components/ImageReorderGrid.tsx";

export interface UsePostEditorImagesOptions {
  id?: string;
  postStatus: number;
  setIsDirty: (dirty: boolean) => void;
  showToast: (type: "success" | "error", message: string) => void;
}

export function usePostEditorImages({
  id,
  postStatus,
  setIsDirty,
  showToast,
}: UsePostEditorImagesOptions) {
  const [images, setImages] = useState<ImageGridItem[]>([]);
  const [imageInvariantError, setImageInvariantError] = useState<string | null>(null);

  const handleImagesUploaded = (newImages: UploadedImageData[]) => {
    setImageInvariantError(null);
    setIsDirty(true);
    setImages((prev) => {
      const startOrder = prev.length;
      const formatted: ImageGridItem[] = newImages.map((img, index) => ({
        id: img.id || `img_${Date.now()}_${index}`,
        url: img.url,
        storageKey: img.storageKey,
        displayOrder: startOrder + index,
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
      } catch (err) {
        console.error("Failed to remove image from storage:", err);
        showToast("error", "Failed to remove image from backend.");
        return;
      }
    }

    setImages((prev) => {
      const remaining = prev.filter((img) => img.id !== imageId);
      return remaining.map((img, idx) => ({ ...img, displayOrder: idx }));
    });
  };

  const handleSetCoverImage = async (imageId: string) => {
    setImageInvariantError(null);
    setIsDirty(true);
    let reorderedList: ImageGridItem[] = [];

    setImages((prev) => {
      const target = prev.find((img) => img.id === imageId);
      if (!target) return prev;
      const others = prev.filter((img) => img.id !== imageId);
      reorderedList = [target, ...others].map((img, idx) => ({ ...img, displayOrder: idx }));
      return reorderedList;
    });

    if (id && reorderedList.length > 0) {
      try {
        await apiClient.reorderPostImages(id, {
          items: reorderedList.map((img) => ({ id: img.id, displayOrder: img.displayOrder })),
        });
        showToast("success", "Cover image updated successfully.");
      } catch (err) {
        console.error("Failed to synchronize cover image update:", err);
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
