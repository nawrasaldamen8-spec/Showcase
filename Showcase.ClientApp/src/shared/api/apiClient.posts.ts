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
} from "../types/index.ts";
import { httpFetch, USE_MOCK_API } from "./apiClient.base.ts";
import { mockService } from "./mockService.ts";

export const apiPostsClient = {
  async getExplorePosts(
    search?: string,
    pageNumber = 1,
    pageSize = 12,
    category?: string,
  ): Promise<PaginatedList<ExplorePostResponse>> {
    if (USE_MOCK_API) {
      return mockService.getExplorePosts(search, pageNumber, pageSize, category);
    }
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
    if (USE_MOCK_API) {
      return mockService.getPostById(id);
    }
    return httpFetch<PostDetailsResponse>(`/api/posts/${id}`);
  },

  async getProfilePosts(
    username: string,
    pageNumber = 1,
    pageSize = 12,
  ): Promise<PaginatedList<PostSummaryResponse>> {
    if (USE_MOCK_API) {
      return mockService.getProfilePosts(username, pageNumber, pageSize);
    }
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
    pageSize = 10,
  ): Promise<PaginatedList<PostSummaryResponse>> {
    if (USE_MOCK_API) {
      return mockService.getMyPosts(status, pageNumber, pageSize);
    }
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
    if (USE_MOCK_API) {
      return mockService.createPost(data);
    }
    return httpFetch<PostCreatedResponse>("/api/posts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updatePost(id: string, data: UpdatePostRequest): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.updatePost(id, data);
    }
    return httpFetch<void>(`/api/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deletePost(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.deletePost(id);
    }
    return httpFetch<void>(`/api/posts/${id}`, { method: "DELETE" });
  },

  async publishPost(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.publishPost(id);
    }
    return httpFetch<void>(`/api/posts/${id}/publish`, { method: "POST" });
  },

  async unpublishPost(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.unpublishPost(id);
    }
    return httpFetch<void>(`/api/posts/${id}/unpublish`, { method: "POST" });
  },

  async getPostImageUploadUrl(postId: string, data: UploadUrlRequest): Promise<UploadUrlResponse> {
    if (USE_MOCK_API) {
      return mockService.getPostImageUploadUrl(postId, data);
    }
    return httpFetch<UploadUrlResponse>(`/api/posts/${postId}/images/upload-url`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async uploadImageFile(uploadUrl: string, file: File | Blob): Promise<string> {
    if (USE_MOCK_API) {
      return mockService.uploadImageDirect(uploadUrl, file);
    }
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to upload image directly to storage: ${response.statusText}`);
    }
    return uploadUrl;
  },

  async addPostImage(
    postId: string,
    storageKey: string,
    url?: string,
    displayOrder?: number,
  ): Promise<PostImageAddedResponse> {
    if (USE_MOCK_API) {
      return mockService.addPostImage(postId, storageKey, url, displayOrder);
    }
    return httpFetch<PostImageAddedResponse>(`/api/posts/${postId}/images`, {
      method: "POST",
      body: JSON.stringify({ storageKey, displayOrder }),
    });
  },

  async removePostImage(postId: string, imageId: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.removePostImage(postId, imageId);
    }
    return httpFetch<void>(`/api/posts/${postId}/images/${imageId}`, { method: "DELETE" });
  },

  async reorderPostImages(postId: string, data: ReorderPostImagesRequest): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.reorderPostImages(postId, data);
    }
    return httpFetch<void>(`/api/posts/${postId}/images/reorder`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};
