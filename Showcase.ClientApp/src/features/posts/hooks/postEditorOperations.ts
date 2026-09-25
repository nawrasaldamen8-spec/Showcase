import { apiClient } from "@shared/api/apiClient.ts";
import type { ImageGridItem } from "../components/ImageReorderGrid.tsx";

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
      await apiClient.addPostImage(
        targetPostId,
        img.storageKey || `posts/${Date.now()}.jpg`,
        img.url,
        img.displayOrder
      );
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
    postStatus: Number(postData.status),
    images: mappedImages,
  };
}

