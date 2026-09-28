import type {
  AddSocialLinkRequest,
  ProfileDetailsResponse,
  PublicProfileResponse,
  ReorderSocialLinksRequest,
  SocialLinkIdResponse,
  UpdatePhoneRequest,
  UpdateProfileRequest,
  UpdateSocialLinkRequest,
  UploadUrlRequest,
  UploadUrlResponse,
  VerificationRequestDto,
  FeaturedRequestDto,
} from "../types/index.ts";
import { httpFetch } from "./apiClient.base.ts";

export const apiProfileClient = {
  async getProfiles(): Promise<ProfileDetailsResponse[]> {
    return httpFetch<ProfileDetailsResponse[]>("/api/profiles", { requiresAuth: false });
  },

  async getMyProfile(): Promise<ProfileDetailsResponse> {
    return httpFetch<ProfileDetailsResponse>("/api/profiles/me");
  },

  async getPublicProfile(username: string): Promise<PublicProfileResponse> {
    return httpFetch<PublicProfileResponse>(`/api/profiles/${encodeURIComponent(username)}`, {
      requiresAuth: false,
    });
  },

  async updateProfile(data: UpdateProfileRequest): Promise<void> {
    return httpFetch<void>("/api/profiles/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async getAvatarUploadUrl(data: UploadUrlRequest): Promise<UploadUrlResponse> {
    return httpFetch<UploadUrlResponse>("/api/profiles/me/avatar/upload-url", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateAvatar(storageKey: string, _avatarUrl?: string): Promise<void> {
    return httpFetch<void>("/api/profiles/me/avatar", {
      method: "PUT",
      body: JSON.stringify({ storageKey }),
    });
  },

  async removeAvatar(): Promise<void> {
    return httpFetch<void>("/api/profiles/me/avatar", { method: "DELETE" });
  },

  async addSocialLink(data: AddSocialLinkRequest): Promise<SocialLinkIdResponse> {
    return httpFetch<SocialLinkIdResponse>("/api/profiles/me/social-links", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateSocialLink(id: string, data: UpdateSocialLinkRequest): Promise<void> {
    return httpFetch<void>(`/api/profiles/me/social-links/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteSocialLink(id: string): Promise<void> {
    return httpFetch<void>(`/api/profiles/me/social-links/${id}`, { method: "DELETE" });
  },

  async reorderSocialLinks(data: ReorderSocialLinksRequest): Promise<void> {
    return httpFetch<void>("/api/profiles/me/social-links/reorder", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async updatePhone(data: UpdatePhoneRequest): Promise<void> {
    return httpFetch<void>("/api/profiles/me/phone", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async submitVerificationRequest(data: VerificationRequestDto): Promise<void> {
    return httpFetch<void>("/api/profiles/me/verify", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async submitFeaturedRequest(data: FeaturedRequestDto): Promise<void> {
    return httpFetch<void>("/api/profiles/me/featured", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
