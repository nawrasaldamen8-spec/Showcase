import type {
  AddSocialLinkRequest,
  FeaturedRequestDto,
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
} from "../types/index.ts";
import { generateUuid, MockApiError, mockDb, simulateNetworkLatency } from "./mockDb.ts";

export const mockProfileService = {
  async getMyProfile(): Promise<ProfileDetailsResponse> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { user, profile } = mockDb.getAuthenticatedUser(db);

    const sortedSocialLinks = [...profile.socialLinks].sort((a, b) => a.displayOrder - b.displayOrder);

    return {
      id: profile.id,
      userId: user.id,
      email: user.email,
      username: profile.username,
      userName: profile.username,
      firstName: profile.firstName,
      lastName: profile.lastName,
      specialty: profile.specialty,
      bio: profile.bio,
      avatarKey: profile.avatarKey,
      avatarUrl: profile.avatarUrl,
      phoneNumber: profile.phoneNumber || user.phoneNumber,
      accountNumber: profile.accountNumber || user.accountNumber,
      isVerified: profile.isVerified ?? user.isVerified ?? false,
      verificationStatus: profile.verificationStatus ?? user.verificationStatus ?? "none",
      featuredStatus: profile.featuredStatus ?? user.featuredStatus ?? "none",
      socialLinks: sortedSocialLinks.map((s) => ({
        id: s.id,
        platform: s.platform,
        url: s.url,
        displayOrder: s.displayOrder,
      })),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  },

  async getPublicProfile(username: string): Promise<PublicProfileResponse> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();

    const profile = db.profiles.find((p) => p.username.toLowerCase() === username.trim().toLowerCase());
    if (!profile) {
      throw new MockApiError(404, "Profile.NotFound", `Profile not found for username "${username}".`);
    }

    const sortedSocialLinks = [...profile.socialLinks].sort((a, b) => a.displayOrder - b.displayOrder);

    return {
      id: profile.id,
      username: profile.username,
      userName: profile.username,
      firstName: profile.firstName,
      lastName: profile.lastName,
      specialty: profile.specialty,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      phoneNumber: profile.phoneNumber,
      accountNumber: profile.accountNumber,
      isVerified: profile.isVerified ?? false,
      verificationStatus: profile.verificationStatus ?? "none",
      featuredStatus: profile.featuredStatus ?? "none",
      socialLinks: sortedSocialLinks.map((s) => ({
        id: s.id,
        platform: s.platform,
        url: s.url,
        displayOrder: s.displayOrder,
      })),
    };
  },

  async updateProfile(request: UpdateProfileRequest): Promise<void> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { profile } = mockDb.getAuthenticatedUser(db);

    if (!request.firstName?.trim() || !request.lastName?.trim()) {
      throw new MockApiError(400, "Bad Request", "First and last names cannot be empty.");
    }

    if (request.bio && request.bio.length > 500) {
      throw new MockApiError(400, "Profile.InvalidBio", "Biography cannot exceed 500 characters.");
    }

    profile.firstName = request.firstName.trim();
    profile.lastName = request.lastName.trim();
    profile.specialty = request.specialty ? request.specialty.trim() : null;
    profile.bio = request.bio ? request.bio.trim() : null;
    profile.updatedAt = new Date().toISOString();

    mockDb.saveDb(db);
  },

  async getAvatarUploadUrl(request: UploadUrlRequest): Promise<UploadUrlResponse> {
    await simulateNetworkLatency(80, 150);
    const db = mockDb.loadDb();
    const { profile } = mockDb.getAuthenticatedUser(db);

    const ext = request.contentType.split("/")[1] || "jpg";
    const storageKey = `avatars/${profile.id}/${generateUuid()}.${ext}`;
    const uploadUrl = `https://mock-r2-upload.showcase.internal/${storageKey}`;

    return { uploadUrl, storageKey };
  },

  async updateAvatar(storageKey: string, avatarUrl?: string): Promise<void> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { profile } = mockDb.getAuthenticatedUser(db);

    profile.avatarKey = storageKey;
    profile.avatarUrl = avatarUrl || null;
    profile.updatedAt = new Date().toISOString();

    mockDb.saveDb(db);
  },

  async removeAvatar(): Promise<void> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { profile } = mockDb.getAuthenticatedUser(db);

    profile.avatarKey = null;
    profile.avatarUrl = null;
    profile.updatedAt = new Date().toISOString();

    mockDb.saveDb(db);
  },

  async addSocialLink(request: AddSocialLinkRequest): Promise<SocialLinkIdResponse> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { profile } = mockDb.getAuthenticatedUser(db);

    if (!request.platform?.trim()) {
      throw new MockApiError(400, "Bad Request", "Platform name is required.");
    }

    const url = request.url?.trim() || "";
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      throw new MockApiError(400, "SocialLink.InvalidUrl", "URL must be a valid absolute HTTP or HTTPS address.");
    }

    const maxOrder = profile.socialLinks.length > 0 ? Math.max(...profile.socialLinks.map((s) => s.displayOrder)) : -1;

    const newLink = {
      id: `soc_${generateUuid().slice(0, 8)}`,
      profileId: profile.id,
      platform: request.platform.trim(),
      url,
      displayOrder: request.displayOrder ?? maxOrder + 1,
    };

    profile.socialLinks.push(newLink);
    profile.updatedAt = new Date().toISOString();

    mockDb.saveDb(db);
    return { id: newLink.id };
  },

  async updateSocialLink(id: string, request: UpdateSocialLinkRequest): Promise<void> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { profile } = mockDb.getAuthenticatedUser(db);

    const link = profile.socialLinks.find((s) => s.id === id);
    if (!link) {
      throw new MockApiError(404, "SocialLink.NotFound", `Social link with ID "${id}" was not found.`);
    }

    if (!request.platform?.trim()) {
      throw new MockApiError(400, "Bad Request", "Platform name is required.");
    }

    const url = request.url?.trim() || "";
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      throw new MockApiError(400, "SocialLink.InvalidUrl", "URL must be a valid absolute HTTP or HTTPS address.");
    }

    link.platform = request.platform.trim();
    link.url = url;
    profile.updatedAt = new Date().toISOString();

    mockDb.saveDb(db);
  },

  async deleteSocialLink(id: string): Promise<void> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { profile } = mockDb.getAuthenticatedUser(db);

    const index = profile.socialLinks.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new MockApiError(404, "SocialLink.NotFound", `Social link with ID "${id}" was not found.`);
    }

    profile.socialLinks.splice(index, 1);
    profile.updatedAt = new Date().toISOString();

    mockDb.saveDb(db);
  },

  async reorderSocialLinks(request: ReorderSocialLinksRequest): Promise<void> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { profile } = mockDb.getAuthenticatedUser(db);

    if (request.items && request.items.length > 0) {
      const orderMap = new Map(request.items.map((i) => [i.id, i.displayOrder]));
      for (const link of profile.socialLinks) {
        if (orderMap.has(link.id)) {
          link.displayOrder = orderMap.get(link.id)!;
        }
      }
    } else if (request.orderedIds && request.orderedIds.length > 0) {
      request.orderedIds.forEach((id, index) => {
        const link = profile.socialLinks.find((s) => s.id === id);
        if (link) {
          link.displayOrder = index;
        }
      });
    }

    profile.updatedAt = new Date().toISOString();
    mockDb.saveDb(db);
  },

  async updatePhone(request: UpdatePhoneRequest): Promise<void> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { user, profile } = mockDb.getAuthenticatedUser(db);

    const phone = request.phoneNumber?.trim() || "";
    const accountNum = request.accountNumber?.trim() || "";

    user.phoneNumber = phone || undefined;
    user.accountNumber = accountNum || undefined;
    profile.phoneNumber = phone || undefined;
    profile.accountNumber = accountNum || undefined;
    profile.updatedAt = new Date().toISOString();

    mockDb.saveDb(db);
  },

  async submitVerificationRequest(request: VerificationRequestDto): Promise<void> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { user, profile } = mockDb.getAuthenticatedUser(db);

    const message = (request.message || request.notes || "").trim();
    if (!message) {
      throw new MockApiError(400, "Bad Request", "Please provide a message for your verification request.");
    }

    user.verificationStatus = "pending";
    profile.verificationStatus = "pending";
    profile.updatedAt = new Date().toISOString();

    mockDb.saveDb(db);
  },

  async submitFeaturedRequest(request: FeaturedRequestDto): Promise<void> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { user, profile } = mockDb.getAuthenticatedUser(db);

    const message = (request.message || request.notes || "").trim();
    if (!message) {
      throw new MockApiError(400, "Bad Request", "Please provide a message for your featured suggestions request.");
    }

    user.featuredStatus = "pending";
    profile.featuredStatus = "pending";
    profile.updatedAt = new Date().toISOString();

    mockDb.saveDb(db);
  },
};
