import type { ReorderItem, UploadUrlResponse, VerificationStatus } from "./common.ts";

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
  email?: string | null;
  name: string;
  specialty?: string | null;
  country?: string | null;
  bio?: string | null;
  avatarKey?: string | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  accountNumber?: string | null;
  isVerified?: boolean;
  verificationStatus?: VerificationStatus;
  featuredStatus?: "none" | "pending" | "featured" | "rejected";
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
  email?: string | null;
  username: string;
  name: string;
  specialty?: string | null;
  country?: string | null;
  bio?: string | null;
  avatarKey?: string | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  accountNumber?: string | null;
  isVerified?: boolean;
  verificationStatus?: VerificationStatus;
  featuredStatus?: "none" | "pending" | "featured" | "rejected";
  socialLinks: SocialLinkDto[];
  createdAt: string;
  updatedAt?: string | null;
}

export type MyProfileResponse = ProfileDetailsResponse;

export interface PublicProfileResponse {
  id: string;
  username: string;
  name: string;
  specialty?: string | null;
  country?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  accountNumber?: string | null;
  isVerified?: boolean;
  verificationStatus?: VerificationStatus;
  featuredStatus?: "none" | "pending" | "featured" | "rejected";
  socialLinks: SocialLinkDto[];
}

export interface UpdateProfileRequest {
  name: string;
  specialty?: string | null;
  country?: string | null;
  bio?: string | null;
  phoneNumber?: string | null;
  accountNumber?: string | null;
}

export interface UpdatePhoneRequest {
  phoneNumber: string;
  accountNumber?: string;
}

export interface VerificationRequestDto {
  message?: string;
  notes?: string;
  category?: string;
  identificationNumber?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
  documentUrl?: string;
}

export interface FeaturedRequestDto {
  message: string;
  notes?: string;
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

export type ReorderSocialLinkItem = ReorderItem;

export interface ReorderSocialLinksRequest {
  items?: ReorderSocialLinkItem[];
  orderedIds?: string[];
}

export type AvatarUploadUrlResponse = UploadUrlResponse;

export interface SocialLinkIdResponse {
  id: string;
}
