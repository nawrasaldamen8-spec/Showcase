import type { UploadUrlResponse } from "./common.ts";

export interface SocialLink {
  id: string;
  profileId: string;
  platform: string;
  url: string;
  displayOrder: number;
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

export interface SocialLinkDto {
  id: string;
  platform: string;
  url: string;
  displayOrder: number;
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

export type AvatarUploadUrlResponse = UploadUrlResponse;

export interface SocialLinkIdResponse {
  id: string;
}
