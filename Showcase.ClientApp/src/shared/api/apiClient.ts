/**
 * Showcase Portfolio Platform — Pluggable API Client
 *
 * Supports seamless switching between the Stateful LocalStorage Mock API Engine
 * and the live ASP.NET Core 10 backend with zero UI changes.
 */

import {
  type AuthResponse,
  type CurrentUserResponse,
  type ProfileDetailsResponse,
  type PublicProfileResponse,
  type PostDetailsResponse,
  type PostSummaryResponse,
  type ExplorePostResponse,
  type PaginatedList,
  type RegisterRequest,
  type LoginRequest,
  type ChangePasswordRequest,
  type ChangeEmailRequest,
  type ChangeUsernameRequest,
  type UpdateProfileRequest,
  type AddSocialLinkRequest,
  type UpdateSocialLinkRequest,
  type ReorderSocialLinksRequest,
  type CreatePostRequest,
  type UpdatePostRequest,
  type ReorderPostImagesRequest,
  type UploadUrlRequest,
  type UploadUrlResponse,
  type PostImageAddedResponse,
  type SocialLinkIdResponse,
  type PostCreatedResponse,
  type PostStatus,
  type CareerSummary,
  type CareerExperience,
  type CareerAcademic,
  type CareerSkill,
  type CareerCredential,
  type CareerLanguage,
  type CareerAchievement,
} from '../types/index.ts';

import { mockService } from './mockService.ts';
import { careerMockService } from './careerMockService.ts';

/**
 * MASTER SWITCH:
 * Set to `true` to use the interactive offline LocalStorage Mock Engine.
 * Set to `false` to connect to the live ASP.NET Core Minimal APIs backend.
 */
export const USE_MOCK_API = true;

const API_BASE_URL = typeof window !== 'undefined'
  ? (import.meta.env.VITE_API_URL || '')
  : '';

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

async function httpFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.requiresAuth !== false) {
    const auth = mockService.getStoredAuth();
    if (auth?.accessToken) {
      headers.set('Authorization', `Bearer ${auth.accessToken}`);
    }
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { title: response.statusText, status: response.status };
    }
    throw errorBody;
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const apiClient = {
  // -------------------------------------------------------------------------
  // Auth & Account Security
  // -------------------------------------------------------------------------

  async register(data: RegisterRequest): Promise<AuthResponse> {
    if (USE_MOCK_API) {
      return mockService.register(data);
    }
    return httpFetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: false,
    });
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    if (USE_MOCK_API) {
      return mockService.login(data);
    }
    return httpFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: false,
    });
  },

  async logout(): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.logout();
    }
    return httpFetch<void>('/api/auth/logout', { method: 'POST' });
  },

  async getCurrentUser(): Promise<CurrentUserResponse | null> {
    if (USE_MOCK_API) {
      return mockService.getCurrentUser();
    }
    try {
      return await httpFetch<CurrentUserResponse>('/api/auth/me');
    } catch {
      return null;
    }
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.changePassword(data);
    }
    return httpFetch<void>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async changeEmail(data: ChangeEmailRequest): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.changeEmail(data);
    }
    return httpFetch<void>('/api/auth/change-email', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async changeUsername(data: ChangeUsernameRequest): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.changeUsername(data);
    }
    return httpFetch<void>('/api/auth/change-username', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // -------------------------------------------------------------------------
  // Creator Profiles
  // -------------------------------------------------------------------------

  async getMyProfile(): Promise<ProfileDetailsResponse> {
    if (USE_MOCK_API) {
      return mockService.getMyProfile();
    }
    return httpFetch<ProfileDetailsResponse>('/api/profiles/me');
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
    return httpFetch<void>('/api/profiles/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getAvatarUploadUrl(data: UploadUrlRequest): Promise<UploadUrlResponse> {
    if (USE_MOCK_API) {
      return mockService.getAvatarUploadUrl(data);
    }
    return httpFetch<UploadUrlResponse>('/api/profiles/me/avatar/upload-url', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAvatar(storageKey: string, avatarUrl?: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.updateAvatar(storageKey, avatarUrl);
    }
    return httpFetch<void>('/api/profiles/me/avatar', {
      method: 'PUT',
      body: JSON.stringify({ storageKey }),
    });
  },

  async removeAvatar(): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.removeAvatar();
    }
    return httpFetch<void>('/api/profiles/me/avatar', { method: 'DELETE' });
  },

  // -------------------------------------------------------------------------
  // Social Links
  // -------------------------------------------------------------------------

  async addSocialLink(data: AddSocialLinkRequest): Promise<SocialLinkIdResponse> {
    if (USE_MOCK_API) {
      return mockService.addSocialLink(data);
    }
    return httpFetch<SocialLinkIdResponse>('/api/profiles/me/social-links', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateSocialLink(id: string, data: UpdateSocialLinkRequest): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.updateSocialLink(id, data);
    }
    return httpFetch<void>(`/api/profiles/me/social-links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteSocialLink(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.deleteSocialLink(id);
    }
    return httpFetch<void>(`/api/profiles/me/social-links/${id}`, { method: 'DELETE' });
  },

  async reorderSocialLinks(data: ReorderSocialLinksRequest): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.reorderSocialLinks(data);
    }
    return httpFetch<void>('/api/profiles/me/social-links/reorder', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // -------------------------------------------------------------------------
  // Posts & Post Images
  // -------------------------------------------------------------------------

  async getExplorePosts(
    search?: string,
    pageNumber = 1,
    pageSize = 12,
    category?: string
  ): Promise<PaginatedList<ExplorePostResponse>> {
    if (USE_MOCK_API) {
      return mockService.getExplorePosts(search, pageNumber, pageSize, category);
    }
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });
    if (search) params.set('search', search);
    if (category && category !== 'All') params.set('category', category);

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
    pageSize = 12
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
      { requiresAuth: false }
    );
  },

  async getCreatorPosts(
    username: string,
    pageNumber = 1,
    pageSize = 12
  ): Promise<PaginatedList<PostSummaryResponse>> {
    return this.getProfilePosts(username, pageNumber, pageSize);
  },

  async getMyPosts(
    status?: PostStatus | 'all',
    pageNumber = 1,
    pageSize = 10
  ): Promise<PaginatedList<PostSummaryResponse>> {
    if (USE_MOCK_API) {
      return mockService.getMyPosts(status, pageNumber, pageSize);
    }
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });
    if (status !== undefined && status !== 'all') {
      params.set('status', status.toString());
    }
    return httpFetch<PaginatedList<PostSummaryResponse>>(`/api/posts/mine?${params.toString()}`);
  },

  async createPost(data: CreatePostRequest): Promise<PostCreatedResponse> {
    if (USE_MOCK_API) {
      return mockService.createPost(data);
    }
    return httpFetch<PostCreatedResponse>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePost(id: string, data: UpdatePostRequest): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.updatePost(id, data);
    }
    return httpFetch<void>(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deletePost(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.deletePost(id);
    }
    return httpFetch<void>(`/api/posts/${id}`, { method: 'DELETE' });
  },

  async publishPost(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.publishPost(id);
    }
    return httpFetch<void>(`/api/posts/${id}/publish`, { method: 'POST' });
  },

  async unpublishPost(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.unpublishPost(id);
    }
    return httpFetch<void>(`/api/posts/${id}/unpublish`, { method: 'POST' });
  },

  async getPostImageUploadUrl(postId: string, data: UploadUrlRequest): Promise<UploadUrlResponse> {
    if (USE_MOCK_API) {
      return mockService.getPostImageUploadUrl(postId, data);
    }
    return httpFetch<UploadUrlResponse>(`/api/posts/${postId}/images/upload-url`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async uploadImageFile(uploadUrl: string, file: File | Blob): Promise<string> {
    if (USE_MOCK_API) {
      return mockService.uploadImageDirect(uploadUrl, file);
    }
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
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
    displayOrder?: number
  ): Promise<PostImageAddedResponse> {
    if (USE_MOCK_API) {
      return mockService.addPostImage(postId, storageKey, url, displayOrder);
    }
    return httpFetch<PostImageAddedResponse>(`/api/posts/${postId}/images`, {
      method: 'POST',
      body: JSON.stringify({ storageKey, displayOrder }),
    });
  },

  async removePostImage(postId: string, imageId: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.removePostImage(postId, imageId);
    }
    return httpFetch<void>(`/api/posts/${postId}/images/${imageId}`, { method: 'DELETE' });
  },

  async reorderPostImages(postId: string, data: ReorderPostImagesRequest): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.reorderPostImages(postId, data);
    }
    return httpFetch<void>(`/api/posts/${postId}/images/reorder`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // -------------------------------------------------------------------------
  // Career Hub & Sub-sections
  // -------------------------------------------------------------------------

  async getCareerSummary(): Promise<CareerSummary> {
    if (USE_MOCK_API) {
      return careerMockService.getCareerSummary();
    }
    return httpFetch<CareerSummary>('/api/career/summary');
  },

  async getExperiences(): Promise<CareerExperience[]> {
    if (USE_MOCK_API) {
      return careerMockService.getExperiences();
    }
    return httpFetch<CareerExperience[]>('/api/career/experiences');
  },

  async createExperience(data: Omit<CareerExperience, 'id' | 'createdAt'>): Promise<CareerExperience> {
    if (USE_MOCK_API) {
      return careerMockService.createExperience(data);
    }
    return httpFetch<CareerExperience>('/api/career/experiences', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateExperience(id: string, data: Partial<CareerExperience>): Promise<CareerExperience> {
    if (USE_MOCK_API) {
      return careerMockService.updateExperience(id, data);
    }
    return httpFetch<CareerExperience>(`/api/career/experiences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteExperience(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return careerMockService.deleteExperience(id);
    }
    return httpFetch<void>(`/api/career/experiences/${id}`, { method: 'DELETE' });
  },

  async getAcademics(): Promise<CareerAcademic[]> {
    if (USE_MOCK_API) {
      return careerMockService.getAcademics();
    }
    return httpFetch<CareerAcademic[]>('/api/career/academics');
  },

  async createAcademic(data: Omit<CareerAcademic, 'id' | 'createdAt'>): Promise<CareerAcademic> {
    if (USE_MOCK_API) {
      return careerMockService.createAcademic(data);
    }
    return httpFetch<CareerAcademic>('/api/career/academics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAcademic(id: string, data: Partial<CareerAcademic>): Promise<CareerAcademic> {
    if (USE_MOCK_API) {
      return careerMockService.updateAcademic(id, data);
    }
    return httpFetch<CareerAcademic>(`/api/career/academics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteAcademic(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return careerMockService.deleteAcademic(id);
    }
    return httpFetch<void>(`/api/career/academics/${id}`, { method: 'DELETE' });
  },

  async getSkills(): Promise<CareerSkill[]> {
    if (USE_MOCK_API) {
      return careerMockService.getSkills();
    }
    return httpFetch<CareerSkill[]>('/api/career/skills');
  },

  async createSkill(data: Omit<CareerSkill, 'id' | 'createdAt'>): Promise<CareerSkill> {
    if (USE_MOCK_API) {
      return careerMockService.createSkill(data);
    }
    return httpFetch<CareerSkill>('/api/career/skills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateSkill(id: string, data: Partial<CareerSkill>): Promise<CareerSkill> {
    if (USE_MOCK_API) {
      return careerMockService.updateSkill(id, data);
    }
    return httpFetch<CareerSkill>(`/api/career/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteSkill(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return careerMockService.deleteSkill(id);
    }
    return httpFetch<void>(`/api/career/skills/${id}`, { method: 'DELETE' });
  },

  async getCredentials(): Promise<CareerCredential[]> {
    if (USE_MOCK_API) {
      return careerMockService.getCredentials();
    }
    return httpFetch<CareerCredential[]>('/api/career/credentials');
  },

  async createCredential(data: Omit<CareerCredential, 'id' | 'createdAt'>): Promise<CareerCredential> {
    if (USE_MOCK_API) {
      return careerMockService.createCredential(data);
    }
    return httpFetch<CareerCredential>('/api/career/credentials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCredential(id: string, data: Partial<CareerCredential>): Promise<CareerCredential> {
    if (USE_MOCK_API) {
      return careerMockService.updateCredential(id, data);
    }
    return httpFetch<CareerCredential>(`/api/career/credentials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCredential(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return careerMockService.deleteCredential(id);
    }
    return httpFetch<void>(`/api/career/credentials/${id}`, { method: 'DELETE' });
  },

  async getLanguages(): Promise<CareerLanguage[]> {
    if (USE_MOCK_API) {
      return careerMockService.getLanguages();
    }
    return httpFetch<CareerLanguage[]>('/api/career/languages');
  },

  async createLanguage(data: Omit<CareerLanguage, 'id' | 'createdAt'>): Promise<CareerLanguage> {
    if (USE_MOCK_API) {
      return careerMockService.createLanguage(data);
    }
    return httpFetch<CareerLanguage>('/api/career/languages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateLanguage(id: string, data: Partial<CareerLanguage>): Promise<CareerLanguage> {
    if (USE_MOCK_API) {
      return careerMockService.updateLanguage(id, data);
    }
    return httpFetch<CareerLanguage>(`/api/career/languages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteLanguage(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return careerMockService.deleteLanguage(id);
    }
    return httpFetch<void>(`/api/career/languages/${id}`, { method: 'DELETE' });
  },

  async getAchievements(): Promise<CareerAchievement[]> {
    if (USE_MOCK_API) {
      return careerMockService.getAchievements();
    }
    return httpFetch<CareerAchievement[]>('/api/career/achievements');
  },

  async createAchievement(data: Omit<CareerAchievement, 'id' | 'createdAt'>): Promise<CareerAchievement> {
    if (USE_MOCK_API) {
      return careerMockService.createAchievement(data);
    }
    return httpFetch<CareerAchievement>('/api/career/achievements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAchievement(id: string, data: Partial<CareerAchievement>): Promise<CareerAchievement> {
    if (USE_MOCK_API) {
      return careerMockService.updateAchievement(id, data);
    }
    return httpFetch<CareerAchievement>(`/api/career/achievements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteAchievement(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return careerMockService.deleteAchievement(id);
    }
    return httpFetch<void>(`/api/career/achievements/${id}`, { method: 'DELETE' });
  },

  // -------------------------------------------------------------------------
  // Sandbox Utilities
  // -------------------------------------------------------------------------

  getActivePersona(): 'visitor' | 'creator' {
    return mockService.getActivePersona();
  },

  async switchPersona(persona: 'visitor' | 'creator'): Promise<void> {
    mockService.setActivePersona(persona);
  },

  resetDatabase(): void {
    mockService.resetDatabase();
  },
};
