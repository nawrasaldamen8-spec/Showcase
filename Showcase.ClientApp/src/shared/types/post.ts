import type { ReorderItem, UploadUrlResponse } from "./common.ts";

export const PostStatus = {
  Draft: 0,
  Published: 1,
  Unpublished: 2,
} as const;

export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus];

export const PostStatusName = {
  [PostStatus.Draft]: "Draft",
  [PostStatus.Published]: "Published",
  [PostStatus.Unpublished]: "Unpublished",
} as const;

export type PostStatusName = (typeof PostStatusName)[keyof typeof PostStatusName];

export interface PostImage {
  id: string;
  postId: string;
  storageKey: string;
  url: string;
  displayOrder: number;
  createdAt: string;
}

export interface Post {
  id: string;
  profileId: string;
  title: string;
  description: string;
  externalUrl?: string | null;
  status: PostStatus;
  tags?: string[];
  likeCount?: number;
  isLiked?: boolean;
  createdAt: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  images: PostImage[];
}

export interface PostImageDto {
  id: string;
  storageKey: string;
  url: string;
  displayOrder: number;
}

export interface PostCreatorDto {
  profileId: string;
  username: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
  isVerified?: boolean;
}

export interface PostDetailsResponse {
  id: string;
  profileId: string;
  title: string;
  description: string;
  externalUrl?: string | null;
  status: PostStatus;
  tags?: string[];
  likeCount?: number;
  isLiked?: boolean;
  createdAt: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  images: PostImageDto[];
  creator?: PostCreatorDto | null;
}

export type PostResponse = PostDetailsResponse;

export interface PostSummaryResponse {
  id: string;
  profileId: string;
  title: string;
  description: string;
  externalUrl?: string | null;
  status: PostStatus;
  tags?: string[];
  likeCount?: number;
  isLiked?: boolean;
  createdAt: string;
  publishedAt?: string | null;
  thumbnailUrl?: string | null;
  imageCount: number;
  creator?: PostCreatorDto | null;
}

export type ExplorePostResponse = PostSummaryResponse;

export interface PostPayload {
  title: string;
  description?: string;
  externalUrl?: string | null;
  tags?: string[];
}

export type CreatePostRequest = PostPayload;
export type UpdatePostRequest = PostPayload;

export type ReorderPostImageItem = ReorderItem;

export interface ReorderPostImagesRequest {
  items?: ReorderPostImageItem[];
  orderedImageIds?: string[];
}

export type PostImageUploadUrlResponse = UploadUrlResponse;

export interface PostImageAddedResponse {
  id?: string;
  imageId: string;
}

export interface PostCreatedResponse {
  id: string;
}
