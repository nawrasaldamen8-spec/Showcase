import {
  PostStatus,
  type CreatePostRequest,
  type Post,
  type PostCreatedResponse,
  type PostImageAddedResponse,
  type ReorderPostImagesRequest,
  type UpdatePostRequest,
  type UploadUrlRequest,
  type UploadUrlResponse,
} from "../types/index.ts";
import { generateUuid, MockApiError, mockDb, type MockDatabase, simulateNetworkLatency } from "./mockDb.ts";

function getOwnedPost(db: MockDatabase, postId: string, profileId: string): Post {
  const post = db.posts.find((p) => p.id === postId);
  if (!post) {
    throw new MockApiError(404, "Post.NotFound", `Post with ID "${postId}" was not found.`);
  }
  if (post.profileId !== profileId) {
    throw new MockApiError(403, "Post.UnauthorizedAccess", "You do not own this post.");
  }
  return post;
}

export const mockPostsCommandService = {
  async createPost(request: CreatePostRequest): Promise<PostCreatedResponse> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { profile } = mockDb.getAuthenticatedUser(db);

    if (!request.title?.trim()) {
      throw new MockApiError(400, "Bad Request", "Title is required.");
    }

    const postId = generateUuid();
    const now = new Date().toISOString();

    const newPost: Post = {
      id: postId,
      profileId: profile.id,
      title: request.title.trim(),
      description: request.description?.trim() || "",
      externalUrl: request.externalUrl?.trim() || null,
      tags: request.tags || [],
      status: PostStatus.Draft,
      createdAt: now,
      publishedAt: null,
      updatedAt: null,
      images: [],
    };

    db.posts.unshift(newPost);
    mockDb.saveDb(db);

    return { id: postId };
  },

  async updatePost(id: string, request: UpdatePostRequest): Promise<void> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { profile } = mockDb.getAuthenticatedUser(db);
    const post = getOwnedPost(db, id, profile.id);

    if (!request.title?.trim()) {
      throw new MockApiError(400, "Bad Request", "Title is required.");
    }

    post.title = request.title.trim();
    post.description = request.description?.trim() || "";
    post.externalUrl = request.externalUrl?.trim() || null;
    if (request.tags) {
      post.tags = request.tags;
    }
    post.updatedAt = new Date().toISOString();

    mockDb.saveDb(db);
  },

  async deletePost(id: string): Promise<void> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { profile } = mockDb.getAuthenticatedUser(db);
    const post = getOwnedPost(db, id, profile.id);

    const index = db.posts.indexOf(post);
    db.posts.splice(index, 1);
    mockDb.saveDb(db);
  },

  async publishPost(id: string): Promise<void> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { profile } = mockDb.getAuthenticatedUser(db);
    const post = getOwnedPost(db, id, profile.id);

    if (!post.images || post.images.length === 0) {
      throw new MockApiError(
        400,
        "Post.CannotPublishEmptyPost",
        "A post cannot be published without at least one uploaded image.",
      );
    }

    const now = new Date().toISOString();
    post.status = PostStatus.Published;
    post.publishedAt = post.publishedAt || now;
    post.updatedAt = now;

    mockDb.saveDb(db);
  },

  async unpublishPost(id: string): Promise<void> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { profile } = mockDb.getAuthenticatedUser(db);
    const post = getOwnedPost(db, id, profile.id);

    post.status = PostStatus.Unpublished;
    post.updatedAt = new Date().toISOString();

    mockDb.saveDb(db);
  },

  async getPostImageUploadUrl(postId: string, request: UploadUrlRequest): Promise<UploadUrlResponse> {
    await simulateNetworkLatency(80, 150);
    const db = mockDb.loadDb();
    const { profile } = mockDb.getAuthenticatedUser(db);
    getOwnedPost(db, postId, profile.id);

    const ext = request.contentType.split("/")[1] || "jpg";
    const storageKey = `posts/${profile.id}/${generateUuid()}.${ext}`;
    const uploadUrl = `https://mock-r2-upload.showcase.internal/${storageKey}`;

    return { uploadUrl, storageKey };
  },

  async uploadImageDirect(uploadUrl: string, file: File | Blob): Promise<string> {
    await simulateNetworkLatency(150, 350);
    if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
      return URL.createObjectURL(file);
    }
    return uploadUrl;
  },

  async addPostImage(
    postId: string,
    storageKey: string,
    url?: string,
    displayOrder?: number,
  ): Promise<PostImageAddedResponse> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { profile } = mockDb.getAuthenticatedUser(db);
    const post = getOwnedPost(db, postId, profile.id);

    const maxOrder = post.images.length > 0 ? Math.max(...post.images.map((i) => i.displayOrder)) : -1;
    const order = displayOrder !== undefined ? displayOrder : maxOrder + 1;
    const imageId = `img_${generateUuid().slice(0, 8)}`;

    const newImage = {
      id: imageId,
      postId,
      storageKey,
      url: url || `https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80`,
      displayOrder: order,
      createdAt: new Date().toISOString(),
    };

    post.images.push(newImage);
    post.updatedAt = new Date().toISOString();

    mockDb.saveDb(db);
    return { imageId };
  },

  async removePostImage(postId: string, imageId: string): Promise<void> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { profile } = mockDb.getAuthenticatedUser(db);
    const post = getOwnedPost(db, postId, profile.id);

    const imgIndex = post.images.findIndex((i) => i.id === imageId);
    if (imgIndex === -1) {
      throw new MockApiError(404, "PostImage.NotFound", `Post image with ID "${imageId}" was not found.`);
    }

    if (post.status === PostStatus.Published && post.images.length <= 1) {
      throw new MockApiError(
        409,
        "Post.CannotRemoveLastImageFromPublishedPost",
        "Cannot remove the final remaining image from a published post. Unpublish the post first or upload a replacement.",
      );
    }

    post.images.splice(imgIndex, 1);
    post.updatedAt = new Date().toISOString();

    mockDb.saveDb(db);
  },

  async reorderPostImages(postId: string, request: ReorderPostImagesRequest): Promise<void> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { profile } = mockDb.getAuthenticatedUser(db);
    const post = getOwnedPost(db, postId, profile.id);

    if (request.items && request.items.length > 0) {
      const orderMap = new Map(request.items.map((i) => [i.id, i.displayOrder]));
      for (const img of post.images) {
        if (orderMap.has(img.id)) {
          img.displayOrder = orderMap.get(img.id)!;
        }
      }
    } else if (request.orderedImageIds && request.orderedImageIds.length > 0) {
      request.orderedImageIds.forEach((id, index) => {
        const img = post.images.find((i) => i.id === id);
        if (img) {
          img.displayOrder = index;
        }
      });
    }

    post.images.sort((a, b) => a.displayOrder - b.displayOrder);
    post.updatedAt = new Date().toISOString();

    mockDb.saveDb(db);
  },
};
