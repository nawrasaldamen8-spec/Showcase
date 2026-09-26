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
import { httpFetch, USE_MOCK_API } from "./apiClient.base.ts";
import { mockService } from "./mockService.ts";

export const apiProfileClient = {
  async getMyProfile(): Promise<ProfileDetailsResponse> {
    if (USE_MOCK_API) {
      return mockService.getMyProfile();
    }
    return httpFetch<ProfileDetailsResponse>("/api/profiles/me");
  },

  async getPublicProfile(username: string): Promise<PublicProfileResponse> {
    if (USE_MOCK_API) {
      return mockService.getPublicProfile(username);
    }
    return httpFetch<PublicProfileResponse>(`/api/profiles/${encodeURIComponent(username)}`, {
      requiresAuth: false,
    });
  },

  async updateProfile(data: UpdateProfileRequest): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.updateProfile(data);
    }
    return httpFetch<void>("/api/profiles/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async getAvatarUploadUrl(data: UploadUrlRequest): Promise<UploadUrlResponse> {
    if (USE_MOCK_API) {
      return mockService.getAvatarUploadUrl(data);
    }
    return httpFetch<UploadUrlResponse>("/api/profiles/me/avatar/upload-url", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateAvatar(storageKey: string, avatarUrl?: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.updateAvatar(storageKey, avatarUrl);
    }
    return httpFetch<void>("/api/profiles/me/avatar", {
      method: "PUT",
      body: JSON.stringify({ storageKey }),
    });
  },

  async removeAvatar(): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.removeAvatar();
    }
    return httpFetch<void>("/api/profiles/me/avatar", { method: "DELETE" });
  },

  async addSocialLink(data: AddSocialLinkRequest): Promise<SocialLinkIdResponse> {
    if (USE_MOCK_API) {
      return mockService.addSocialLink(data);
    }
    return httpFetch<SocialLinkIdResponse>("/api/profiles/me/social-links", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateSocialLink(id: string, data: UpdateSocialLinkRequest): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.updateSocialLink(id, data);
    }
    return httpFetch<void>(`/api/profiles/me/social-links/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteSocialLink(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.deleteSocialLink(id);
    }
    return httpFetch<void>(`/api/profiles/me/social-links/${id}`, { method: "DELETE" });
  },

  async reorderSocialLinks(data: ReorderSocialLinksRequest): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.reorderSocialLinks(data);
    }
    return httpFetch<void>("/api/profiles/me/social-links/reorder", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async updatePhone(data: UpdatePhoneRequest): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.updatePhone(data);
    }
    return httpFetch<void>("/api/profiles/me/phone", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async submitVerificationRequest(data: VerificationRequestDto): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.submitVerificationRequest(data);
    }
    return httpFetch<void>("/api/profiles/me/verify", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async submitFeaturedRequest(data: FeaturedRequestDto): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.submitFeaturedRequest(data);
    }
    return httpFetch<void>("/api/profiles/me/featured", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
