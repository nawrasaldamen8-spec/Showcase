/**
 * Showcase Portfolio Platform — Domain Entities & DTO Contracts
 * Mirrored 1:1 with ASP.NET Core backend Clean Architecture specifications.
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const PostStatus = {
  Draft: 0,
  Published: 1,
  Unpublished: 2,
} as const;

export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus];

export const PostStatusName = {
  [PostStatus.Draft]: 'Draft',
  [PostStatus.Published]: 'Published',
  [PostStatus.Unpublished]: 'Unpublished',
} as const;

export type PostStatusName = (typeof PostStatusName)[keyof typeof PostStatusName];

// ---------------------------------------------------------------------------
// Entities (In-Memory / LocalStorage Domain Schema)
// ---------------------------------------------------------------------------

export interface SocialLink {
  id: string;
  profileId: string;
  platform: string;
  url: string;
  displayOrder: number;
}

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
  createdAt: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  images: PostImage[];
}

export interface Profile {
  id: string;
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string | null;
  avatarKey?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  socialLinks: SocialLink[];
}

export interface UserAccount {
  id: string;
  email: string;
  username: string;
  passwordHash: string; // for mock authentication simulation
  profileId: string;
  roles: string[];
}

// ---------------------------------------------------------------------------
// DTOs & Responses
// ---------------------------------------------------------------------------

export interface SocialLinkDto {
  id: string;
  platform: string;
  url: string;
  displayOrder: number;
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
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  bio?: string | null;
}

export interface UserIdentityDetails {
  id: string;
  email: string;
  userName: string;
  roles: string[];
}

export interface CurrentUserResponse {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profileId: string;
  bio?: string | null;
  avatarUrl?: string | null;
  roles: string[];
}

export interface ProfileDetailsResponse {
  id: string;
  userId: string;
  email: string;
  username: string;
  userName?: string;
  firstName: string;
  lastName: string;
  bio?: string | null;
  avatarKey?: string | null;
  avatarUrl?: string | null;
  socialLinks: SocialLinkDto[];
  createdAt: string;
  updatedAt?: string | null;
}

export type MyProfileResponse = ProfileDetailsResponse;

export interface PublicProfileResponse {
  id: string;
  username: string;
  userName?: string;
  firstName: string;
  lastName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  socialLinks: SocialLinkDto[];
}

export interface PostDetailsResponse {
  id: string;
  profileId: string;
  title: string;
  description: string;
  externalUrl?: string | null;
  status: PostStatus | string;
  tags?: string[];
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
  status: PostStatus | string;
  tags?: string[];
  createdAt: string;
  publishedAt?: string | null;
  thumbnailUrl?: string | null;
  imageCount: number;
  creator?: PostCreatorDto | null;
}

export type ExplorePostResponse = PostSummaryResponse;

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiry?: string;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Request Models
// ---------------------------------------------------------------------------

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeEmailRequest {
  newEmail: string;
  currentPassword: string;
}

export interface ChangeUsernameRequest {
  newUsername: string;
  currentPassword: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  bio?: string | null;
}

export interface AddSocialLinkRequest {
  platform: string;
  url: string;
  displayOrder?: number | null;
}

export interface UpdateSocialLinkRequest {
  platform: string;
  url: string;
}

export interface ReorderSocialLinkItem {
  id: string;
  displayOrder: number;
}

export interface ReorderSocialLinksRequest {
  items?: ReorderSocialLinkItem[];
  orderedIds?: string[];
}

export interface CreatePostRequest {
  title: string;
  description?: string;
  externalUrl?: string | null;
  tags?: string[];
}

export interface UpdatePostRequest {
  title: string;
  description?: string;
  externalUrl?: string | null;
  tags?: string[];
}

export interface ReorderPostImageItem {
  id: string;
  displayOrder: number;
}

export interface ReorderPostImagesRequest {
  items?: ReorderPostImageItem[];
  orderedImageIds?: string[];
}

export interface UploadUrlRequest {
  contentType: string;
  fileSizeBytes: number;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  storageKey: string;
}

export type AvatarUploadUrlResponse = UploadUrlResponse;
export type PostImageUploadUrlResponse = UploadUrlResponse;

export interface PostImageAddedResponse {
  imageId: string;
}

export interface SocialLinkIdResponse {
  id: string;
}

export interface PostCreatedResponse {
  id: string;
}

// ---------------------------------------------------------------------------
// Career Module Domain Contracts
// ---------------------------------------------------------------------------
export * from "./career.ts";
