import { apiClient } from "@shared/api/apiClient.ts";
import type { ImageGridItem } from "../components/ImageReorderGrid.tsx";
import { normalizePostStatus } from "../utils.ts";

export interface PersistPostDataOptions {
  id?: string;
  title: string;
  description: string;
  externalUrl: string | null;
  tags: string[];
  images: ImageGridItem[];
}

export async function persistPostData({
  id,
  title,
  description,
  externalUrl,
  tags,
  images,
}: PersistPostDataOptions): Promise<string> {
  let targetPostId = id;
  if (!targetPostId) {
    const created = await apiClient.createPost({
      title: title.trim(),
      description: description.trim(),
      externalUrl,
      tags,
    });
    targetPostId = created.id;
    for (const img of images) {
      let finalKey = img.storageKey;
      let finalUrl = img.url;

      if (img.file) {
        try {
          const { uploadUrl, storageKey } = await apiClient.getPostImageUploadUrl(targetPostId, {
            contentType: img.file.type || "image/jpeg",
            fileSizeBytes: img.file.size,
          });
          finalUrl = await apiClient.uploadImageFile(uploadUrl, img.file);
          finalKey = storageKey;
        } catch (uploadErr) {
          console.error("Failed to upload staged image binary to storage:", uploadErr);
        }
      }

      if (finalKey) {
        await apiClient.addPostImage(
          targetPostId,
          finalKey,
          finalUrl,
          img.displayOrder
        );
      }
    }
  } else {
    await apiClient.updatePost(targetPostId, {
      title: title.trim(),
      description: description.trim(),
      externalUrl,
      tags,
    });
  }
  return targetPostId;
}

export async function fetchPostEditorData(id: string) {
  const postData = await apiClient.getPostById(id);
  const mappedImages: ImageGridItem[] = (postData.images || []).map((img, idx) => ({
    id: img.id,
    url: img.url,
    storageKey: img.storageKey,
    displayOrder: img.displayOrder !== undefined ? img.displayOrder : idx,
  }));
  return {
    title: postData.title || "",
    description: postData.description || "",
    externalUrl: postData.externalUrl || "",
    tags: postData.tags || [],
    postStatus: normalizePostStatus(postData.status),
    images: mappedImages,
  };
}

