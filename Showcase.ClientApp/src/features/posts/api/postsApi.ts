import type {
  CreatePostRequest,
  ExplorePostResponse,
  PaginatedList,
  PostCreatedResponse,
  PostDetailsResponse,
  PostImageAddedResponse,
  PostStatus,
  PostSummaryResponse,
  ReorderPostImagesRequest,
  UpdatePostRequest,
  UploadUrlRequest,
  UploadUrlResponse,
} from "@shared/types/index.ts";
import { httpFetch } from "@shared/api/apiClient.base.ts";
import { mediaUploadService } from "@shared/services/mediaUploadService.ts";

export const apiPostsClient = {
  async getExplorePosts(
    search?: string,
    pageNumber = 1,
    pageSize = 12,
    category?: string,
  ): Promise<PaginatedList<ExplorePostResponse>> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });
    if (search) params.set("search", search);
    if (category && category !== "All") params.set("category", category);

    return httpFetch<PaginatedList<ExplorePostResponse>>(`/api/posts/explore?${params.toString()}`, {
      requiresAuth: false,
    });
  },

  async getPostById(id: string): Promise<PostDetailsResponse> {
    return httpFetch<PostDetailsResponse>(`/api/posts/${id}`);
  },

  async getProfilePosts(
    username: string,
    pageNumber = 1,
    pageSize = 12,
  ): Promise<PaginatedList<PostSummaryResponse>> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });
    return httpFetch<PaginatedList<PostSummaryResponse>>(
      `/api/profiles/${encodeURIComponent(username)}/posts?${params.toString()}`,
      { requiresAuth: false },
    );
  },

  async getCreatorPosts(
    username: string,
    pageNumber = 1,
    pageSize = 12,
  ): Promise<PaginatedList<PostSummaryResponse>> {
    return this.getProfilePosts(username, pageNumber, pageSize);
  },

  async getMyPosts(
    status?: PostStatus | "all",
    pageNumber = 1,
    pageSize = 50,
  ): Promise<PaginatedList<PostSummaryResponse>> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });
    if (status !== undefined && status !== "all") {
      params.set("status", status.toString());
    }
    return httpFetch<PaginatedList<PostSummaryResponse>>(`/api/posts/mine?${params.toString()}`);
  },

  async createPost(data: CreatePostRequest): Promise<PostCreatedResponse> {
    const res = await httpFetch<PostCreatedResponse | string>("/api/posts", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (typeof res === "string") {
      return { id: res };
    }
    return res;
  },

  async updatePost(id: string, data: UpdatePostRequest): Promise<void> {
    return httpFetch<void>(`/api/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deletePost(id: string): Promise<void> {
    return httpFetch<void>(`/api/posts/${id}`, { method: "DELETE" });
  },

  async publishPost(id: string): Promise<void> {
    return httpFetch<void>(`/api/posts/${id}/publish`, { method: "PUT" });
  },

  async unpublishPost(id: string): Promise<void> {
    return httpFetch<void>(`/api/posts/${id}/unpublish`, { method: "PUT" });
  },

  async getPostImageUploadUrl(postId: string, data: UploadUrlRequest): Promise<UploadUrlResponse> {
    return httpFetch<UploadUrlResponse>(`/api/posts/${postId}/images/upload-url`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async uploadImageFile(uploadUrl: string, file: File | Blob): Promise<string> {
    return mediaUploadService.uploadDirectToStorage(uploadUrl, file);
  },

  async addPostImage(
    postId: string,
    storageKey: string,
    _url?: string,
    displayOrder?: number,
  ): Promise<PostImageAddedResponse> {
    const res = await httpFetch<{ id?: string; imageId?: string }>(`/api/posts/${postId}/images`, {
      method: "POST",
      body: JSON.stringify({ storageKey, displayOrder }),
    });
    const imgId = res.id || res.imageId || "";
    return {
      id: imgId,
      imageId: imgId,
    };
  },

  async removePostImage(postId: string, imageId: string): Promise<void> {
    return httpFetch<void>(`/api/posts/${postId}/images/${imageId}`, { method: "DELETE" });
  },

  async reorderPostImages(postId: string, data: ReorderPostImagesRequest): Promise<void> {
    return httpFetch<void>(`/api/posts/${postId}/images/reorder`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async toggleLikePost(postId: string, desiredState?: boolean): Promise<{ isLiked: boolean; likeCount: number }> {
    return httpFetch<{ isLiked: boolean; likeCount: number }>(`/api/posts/${postId}/like`, {
      method: "POST",
      body: desiredState !== undefined ? JSON.stringify({ desiredState }) : undefined,
    });
  },
};
