/**
 * Showcase Portfolio Platform — Stateful LocalStorage Mock API Engine
 * Simulates ASP.NET Core Minimal APIs & RFC 7807 ProblemDetails responses.
 */

import {
  PostStatus,
  type AddSocialLinkRequest,
  type AuthResponse,
  type ChangeEmailRequest,
  type ChangePasswordRequest,
  type ChangeUsernameRequest,
  type CreatePostRequest,
  type CurrentUserResponse,
  type ExplorePostResponse,
  type LoginRequest,
  type PaginatedList,
  type Post,
  type PostCreatedResponse,
  type PostDetailsResponse,
  type PostImageAddedResponse,
  type PostSummaryResponse,
  type ProblemDetails,
  type Profile,
  type ProfileDetailsResponse,
  type PublicProfileResponse,
  type RegisterRequest,
  type ReorderPostImagesRequest,
  type ReorderSocialLinksRequest,
  type SocialLinkIdResponse,
  type UpdatePostRequest,
  type UpdateProfileRequest,
  type UpdateSocialLinkRequest,
  type UploadUrlRequest,
  type UploadUrlResponse,
  type UserAccount,
} from "../types/index.ts";

import { INITIAL_POSTS, INITIAL_PROFILES, INITIAL_USERS } from "./mockData.ts";

const DB_STORAGE_KEY = "showcase_portfolio_db";
const AUTH_STORAGE_KEY = "showcase_auth_state";
const PERSONA_STORAGE_KEY = "showcase_active_persona";

interface MockDatabase {
  users: UserAccount[];
  profiles: Profile[];
  posts: Post[];
}

interface StoredAuthState {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function simulateNetworkLatency(minMs = 120, maxMs = 280): Promise<void> {
  const duration = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export class MockApiError extends Error {
  problem: ProblemDetails;

  constructor(status: number, title: string, detail?: string, errors?: Record<string, string[]>) {
    super(detail || title);
    this.name = "MockApiError";
    this.problem = {
      title,
      status,
      detail,
      errors,
    };
  }
}

// ---------------------------------------------------------------------------
// Database State & Synchronization
// ---------------------------------------------------------------------------

class MockDbService {
  private loadDb(): MockDatabase {
    if (typeof window === "undefined") {
      return {
        users: INITIAL_USERS,
        profiles: INITIAL_PROFILES,
        posts: INITIAL_POSTS,
      };
    }

    try {
      const raw = localStorage.getItem(DB_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MockDatabase;
        if (parsed.users && parsed.profiles && parsed.posts) {
          // Merge in any newly added seed posts that are not yet in cached db
          const existingIds = new Set(parsed.posts.map((p) => p.id));
          const newSeedPosts = INITIAL_POSTS.filter((p) => !existingIds.has(p.id));
          if (newSeedPosts.length > 0) {
            parsed.posts.push(...JSON.parse(JSON.stringify(newSeedPosts)));
            this.saveDb(parsed);
          }
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Failed to parse mock database from localStorage; reinitializing.", err);
    }

    const initialDb: MockDatabase = {
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      profiles: JSON.parse(JSON.stringify(INITIAL_PROFILES)),
      posts: JSON.parse(JSON.stringify(INITIAL_POSTS)),
    };
    this.saveDb(initialDb);
    return initialDb;
  }

  private saveDb(db: MockDatabase): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
    }
  }

  public resetDatabase(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(DB_STORAGE_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.setItem(PERSONA_STORAGE_KEY, "creator");
    }
  }

  // -------------------------------------------------------------------------
  // Auth & Persona State
  // -------------------------------------------------------------------------

  public getActivePersona(): "visitor" | "creator" {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(PERSONA_STORAGE_KEY);
      if (stored === "visitor" || stored === "creator") {
        return stored;
      }
    }
    return "creator";
  }

  public setActivePersona(persona: "visitor" | "creator"): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(PERSONA_STORAGE_KEY, persona);
      window.dispatchEvent(new CustomEvent("showcase:persona-change", { detail: persona }));
    }
  }

  public getStoredAuth(): StoredAuthState | null {
    if (typeof window === "undefined") return null;
    const persona = this.getActivePersona();
    if (persona === "visitor") return null;

    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as StoredAuthState;
      }
    } catch {
      // Fallback
    }

    // Default creator session: Elena Vance
    const defaultAuth: StoredAuthState = {
      userId: "usr_elena_vance",
      accessToken: "mock_jwt_token_elena_vance",
      refreshToken: "mock_refresh_token_elena_vance",
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultAuth));
    return defaultAuth;
  }

  public setStoredAuth(auth: StoredAuthState | null): void {
    if (typeof window !== "undefined") {
      if (auth) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }

  private getAuthenticatedUser(db: MockDatabase): { user: UserAccount; profile: Profile } {
    const auth = this.getStoredAuth();
    if (!auth) {
      throw new MockApiError(401, "Unauthorized", "You must be signed in to perform this action.");
    }

    const user = db.users.find((u) => u.id === auth.userId);
    if (!user) {
      throw new MockApiError(401, "Unauthorized", "Authenticated session user not found.");
    }

    const profile = db.profiles.find((p) => p.userId === user.id);
    if (!profile) {
      throw new MockApiError(404, "Profile.NotFoundForUser", "Creator profile not found for user.");
    }

    return { user, profile };
  }

  // -------------------------------------------------------------------------
  // Auth Endpoints Simulation
  // -------------------------------------------------------------------------

  public async register(request: RegisterRequest): Promise<AuthResponse> {
    await simulateNetworkLatency();
    const db = this.loadDb();

    // Validation
    if (!request.email || !request.username || !request.password || !request.firstName || !request.lastName) {
      throw new MockApiError(400, "Bad Request", "All fields are required.");
    }

    const emailTaken = db.users.some((u) => u.email.toLowerCase() === request.email.trim().toLowerCase());
    if (emailTaken) {
      throw new MockApiError(409, "Conflict", "An account with this email address already exists.");
    }

    const usernameTaken = db.users.some((u) => u.username.toLowerCase() === request.username.trim().toLowerCase());
    if (usernameTaken) {
      throw new MockApiError(409, "Conflict", "This username is already taken.");
    }

    const userId = `usr_${generateUuid().slice(0, 8)}`;
    const profileId = generateUuid();
    const now = new Date().toISOString();

    const newUser: UserAccount = {
      id: userId,
      email: request.email.trim().toLowerCase(),
      username: request.username.trim(),
      passwordHash: request.password,
      profileId,
      roles: ["Creator"],
    };

    const newProfile: Profile = {
      id: profileId,
      userId,
      username: request.username.trim(),
      email: request.email.trim().toLowerCase(),
      firstName: request.firstName.trim(),
      lastName: request.lastName.trim(),
      bio: null,
      avatarKey: null,
      avatarUrl: null,
      createdAt: now,
      updatedAt: null,
      socialLinks: [],
    };

    db.users.push(newUser);
    db.profiles.push(newProfile);
    this.saveDb(db);

    const authResponse: AuthResponse = {
      accessToken: `mock_jwt_${userId}_${Date.now()}`,
      refreshToken: `mock_refresh_${userId}_${Date.now()}`,
      expiry: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    this.setStoredAuth({
      userId,
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
    });
    this.setActivePersona("creator");

    return authResponse;
  }

  public async login(request: LoginRequest): Promise<AuthResponse> {
    await simulateNetworkLatency();
    const db = this.loadDb();

    const query = request.emailOrUsername.trim().toLowerCase();
    const user = db.users.find((u) => u.email.toLowerCase() === query || u.username.toLowerCase() === query);

    if (!user || user.passwordHash !== request.password) {
      throw new MockApiError(400, "Bad Request", "Invalid credentials provided.");
    }

    const authResponse: AuthResponse = {
      accessToken: `mock_jwt_${user.id}_${Date.now()}`,
      refreshToken: `mock_refresh_${user.id}_${Date.now()}`,
      expiry: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    this.setStoredAuth({
      userId: user.id,
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
    });
    this.setActivePersona("creator");

    return authResponse;
  }

  public async logout(): Promise<void> {
    await simulateNetworkLatency(50, 100);
    this.setStoredAuth(null);
    this.setActivePersona("visitor");
  }

  public async getCurrentUser(): Promise<CurrentUserResponse | null> {
    await simulateNetworkLatency(80, 150);
    if (this.getActivePersona() === "visitor") {
      return null;
    }

    const db = this.loadDb();
    try {
      const { user, profile } = this.getAuthenticatedUser(db);
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        profileId: profile.id,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        roles: user.roles,
      };
    } catch {
      return null;
    }
  }

  public async changePassword(request: ChangePasswordRequest): Promise<void> {
    await simulateNetworkLatency();
    const db = this.loadDb();
    const { user } = this.getAuthenticatedUser(db);

    if (user.passwordHash !== request.currentPassword) {
      throw new MockApiError(400, "Bad Request", "Current password does not match.");
    }

    if (!request.newPassword || request.newPassword.length < 6) {
      throw new MockApiError(400, "Bad Request", "New password must be at least 6 characters long.");
    }

    user.passwordHash = request.newPassword;
    this.saveDb(db);
  }

  public async changeEmail(request: ChangeEmailRequest): Promise<void> {
    await simulateNetworkLatency();
    const db = this.loadDb();
    const { user, profile } = this.getAuthenticatedUser(db);

    if (user.passwordHash !== request.currentPassword) {
      throw new MockApiError(400, "Bad Request", "Current password does not match.");
    }

    const newEmail = request.newEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      throw new MockApiError(400, "Bad Request", "Please enter a valid email address.");
    }

    const conflict = db.users.some((u) => u.id !== user.id && u.email.toLowerCase() === newEmail);
    if (conflict) {
      throw new MockApiError(409, "Conflict", "This email address is already associated with another account.");
    }

    user.email = newEmail;
    profile.email = newEmail;
    profile.updatedAt = new Date().toISOString();
    this.saveDb(db);
  }

  public async changeUsername(request: ChangeUsernameRequest): Promise<void> {
    await simulateNetworkLatency();
    const db = this.loadDb();
    const { user, profile } = this.getAuthenticatedUser(db);

    if (user.passwordHash !== request.currentPassword) {
      throw new MockApiError(400, "Bad Request", "Current password does not match.");
    }

    const newUsername = request.newUsername.trim();
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    if (!usernameRegex.test(newUsername)) {
      throw new MockApiError(
        400,
        "Bad Request",
        "Username must be between 3 and 30 characters and contain only letters, numbers, underscores, or hyphens.",
      );
    }

    const conflict = db.users.some((u) => u.id !== user.id && u.username.toLowerCase() === newUsername.toLowerCase());
    if (conflict) {
      throw new MockApiError(409, "Conflict", "This username is already taken.");
    }

    user.username = newUsername;
    profile.username = newUsername;
    profile.updatedAt = new Date().toISOString();
    this.saveDb(db);
  }

  // -------------------------------------------------------------------------
  // Profile Endpoints Simulation
  // -------------------------------------------------------------------------

  public async getMyProfile(): Promise<ProfileDetailsResponse> {
    await simulateNetworkLatency();
    const db = this.loadDb();
    const { user, profile } = this.getAuthenticatedUser(db);

    const sortedSocialLinks = [...profile.socialLinks].sort((a, b) => a.displayOrder - b.displayOrder);

    return {
      id: profile.id,
      userId: user.id,
      email: user.email,
      username: profile.username,
      userName: profile.username,
      firstName: profile.firstName,
      lastName: profile.lastName,
      bio: profile.bio,
      avatarKey: profile.avatarKey,
      avatarUrl: profile.avatarUrl,
      socialLinks: sortedSocialLinks.map((s) => ({
        id: s.id,
        platform: s.platform,
        url: s.url,
        displayOrder: s.displayOrder,
      })),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  public async getPublicProfile(username: string): Promise<PublicProfileResponse> {
    await simulateNetworkLatency();
    const db = this.loadDb();

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
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      socialLinks: sortedSocialLinks.map((s) => ({
        id: s.id,
        platform: s.platform,
        url: s.url,
        displayOrder: s.displayOrder,
      })),
    };
  }

  public async updateProfile(request: UpdateProfileRequest): Promise<void> {
    await simulateNetworkLatency();
    const db = this.loadDb();
    const { profile } = this.getAuthenticatedUser(db);

    if (!request.firstName?.trim() || !request.lastName?.trim()) {
      throw new MockApiError(400, "Bad Request", "First and last names cannot be empty.");
    }

    if (request.bio && request.bio.length > 500) {
      throw new MockApiError(400, "Profile.InvalidBio", "Biography cannot exceed 500 characters.");
    }

    profile.firstName = request.firstName.trim();
    profile.lastName = request.lastName.trim();
    profile.bio = request.bio ? request.bio.trim() : null;
    profile.updatedAt = new Date().toISOString();

    this.saveDb(db);
  }

  public async getAvatarUploadUrl(request: UploadUrlRequest): Promise<UploadUrlResponse> {
    await simulateNetworkLatency(80, 150);
    const db = this.loadDb();
    const { profile } = this.getAuthenticatedUser(db);

    const ext = request.contentType.split("/")[1] || "jpg";
    const storageKey = `avatars/${profile.id}/${generateUuid()}.${ext}`;
    const uploadUrl = `https://mock-r2-upload.showcase.internal/${storageKey}`;

    return { uploadUrl, storageKey };
  }

  public async updateAvatar(storageKey: string, avatarUrl?: string): Promise<void> {
    await simulateNetworkLatency();
    const db = this.loadDb();
    const { profile } = this.getAuthenticatedUser(db);

    profile.avatarKey = storageKey;
    // If client provides simulated data/object URL, use it; otherwise generate standard preview
    profile.avatarUrl =
      avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80`;
    profile.updatedAt = new Date().toISOString();

    this.saveDb(db);
  }

  public async removeAvatar(): Promise<void> {
    await simulateNetworkLatency();
    const db = this.loadDb();
    const { profile } = this.getAuthenticatedUser(db);

    profile.avatarKey = null;
    profile.avatarUrl = null;
    profile.updatedAt = new Date().toISOString();

    this.saveDb(db);
  }

  // -------------------------------------------------------------------------
  // Social Links Endpoints Simulation
  // -------------------------------------------------------------------------

  public async addSocialLink(request: AddSocialLinkRequest): Promise<SocialLinkIdResponse> {
    await simulateNetworkLatency();
    const db = this.loadDb();
    const { profile } = this.getAuthenticatedUser(db);

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

    this.saveDb(db);
    return { id: newLink.id };
  }

  public async updateSocialLink(id: string, request: UpdateSocialLinkRequest): Promise<void> {
    await simulateNetworkLatency();
    const db = this.loadDb();
    const { profile } = this.getAuthenticatedUser(db);

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

    this.saveDb(db);
  }

  public async deleteSocialLink(id: string): Promise<void> {
    await simulateNetworkLatency();
    const db = this.loadDb();
    const { profile } = this.getAuthenticatedUser(db);

    const index = profile.socialLinks.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new MockApiError(404, "SocialLink.NotFound", `Social link with ID "${id}" was not found.`);
    }

    profile.socialLinks.splice(index, 1);
    profile.updatedAt = new Date().toISOString();

    this.saveDb(db);
  }

  public async reorderSocialLinks(request: ReorderSocialLinksRequest): Promise<void> {
    await simulateNetworkLatency();
    const db = this.loadDb();
    const { profile } = this.getAuthenticatedUser(db);

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
    this.saveDb(db);
  }

  // -------------------------------------------------------------------------
  // Posts & Post Images Endpoints Simulation
  // -------------------------------------------------------------------------

  public async getExplorePosts(
    search?: string,
    pageNumber = 1,
    pageSize = 12,
    category?: string,
  ): Promise<PaginatedList<ExplorePostResponse>> {
    await simulateNetworkLatency();
    const db = this.loadDb();

    // Only Published posts are visible in the explore feed
    let items = db.posts.filter((p) => p.status === PostStatus.Published);

    if (category && category.trim() && category.trim().toLowerCase() !== "all") {
      const cat = category.trim().toLowerCase();
      items = items.filter((post) => {
        const tagMatch = post.tags?.some((t) => t.toLowerCase().includes(cat));
        const titleMatch = post.title.toLowerCase().includes(cat);
        const descMatch = post.description.toLowerCase().includes(cat);
        return Boolean(tagMatch) || titleMatch || descMatch;
      });
    }

    if (search && search.trim()) {
      const query = search.trim().toLowerCase();
      items = items.filter((post) => {
        const titleMatch = post.title.toLowerCase().includes(query);
        const descMatch = post.description.toLowerCase().includes(query);
        const tagMatch = post.tags?.some((t) => t.toLowerCase().includes(query));

        const creator = db.profiles.find((p) => p.id === post.profileId);
        const creatorMatch = creator
          ? `${creator.firstName} ${creator.lastName} ${creator.username}`.toLowerCase().includes(query)
          : false;

        return titleMatch || descMatch || Boolean(tagMatch) || creatorMatch;
      });
    }

    // Sort by publication timestamp descending
    items.sort((a, b) => {
      const timeA = new Date(a.publishedAt || a.createdAt).getTime();
      const timeB = new Date(b.publishedAt || b.createdAt).getTime();
      return timeB - timeA;
    });

    const totalCount = items.length;
    const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0;
    const pageIndex = Math.max(1, pageNumber);
    const start = (pageIndex - 1) * pageSize;
    const paginatedSlice = items.slice(start, start + pageSize);

    const mappedItems: ExplorePostResponse[] = paginatedSlice.map((post) => {
      const creator = db.profiles.find((p) => p.id === post.profileId);
      const sortedImages = [...post.images].sort((a, b) => a.displayOrder - b.displayOrder);
      const firstImage = sortedImages[0];

      return {
        id: post.id,
        profileId: post.profileId,
        title: post.title,
        description: post.description,
        externalUrl: post.externalUrl,
        status: post.status,
        tags: post.tags,
        createdAt: post.createdAt,
        publishedAt: post.publishedAt,
        thumbnailUrl: firstImage ? firstImage.url : null,
        imageCount: post.images.length,
        creator: creator
          ? {
              profileId: creator.id,
              username: creator.username,
              firstName: creator.firstName,
              lastName: creator.lastName,
              avatarUrl: creator.avatarUrl,
            }
          : null,
      };
    });

    return {
      items: mappedItems,
      pageNumber: pageIndex,
      pageSize,
      totalCount,
      totalPages,
      hasPreviousPage: pageIndex > 1,
      hasNextPage: pageIndex < totalPages,
    };
  }

  public async getPostById(id: string): Promise<PostDetailsResponse> {
    await simulateNetworkLatency();
    const db = this.loadDb();

    const post = db.posts.find((p) => p.id === id);
    if (!post) {
      throw new MockApiError(404, "Post.NotFound", `Post with ID "${id}" was not found.`);
    }

    const creator = db.profiles.find((p) => p.id === post.profileId);

    // Draft privacy enforcement: drafts and unpublished posts return 404 to non-owners
    if (post.status !== PostStatus.Published) {
      let isOwner = false;
      try {
        const { profile } = this.getAuthenticatedUser(db);
        if (profile.id === post.profileId) {
          isOwner = true;
        }
      } catch {
        isOwner = false;
      }

      if (!isOwner) {
        throw new MockApiError(404, "Post.NotFound", `Post with ID "${id}" was not found.`);
      }
    }

    const sortedImages = [...post.images].sort((a, b) => a.displayOrder - b.displayOrder);

    return {
      id: post.id,
      profileId: post.profileId,
      title: post.title,
      description: post.description,
      externalUrl: post.externalUrl,
      status: post.status,
      tags: post.tags,
      createdAt: post.createdAt,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      images: sortedImages.map((img) => ({
        id: img.id,
        storageKey: img.storageKey,
        url: img.url,
        displayOrder: img.displayOrder,
      })),
      creator: creator
        ? {
            profileId: creator.id,
            username: creator.username,
            firstName: creator.firstName,
            lastName: creator.lastName,
            avatarUrl: creator.avatarUrl,
            bio: creator.bio,
          }
        : null,
    };
  }

  public async getProfilePosts(
    username: string,
    pageNumber = 1,
    pageSize = 12,
  ): Promise<PaginatedList<PostSummaryResponse>> {
    await simulateNetworkLatency();
    const db = this.loadDb();

    const profile = db.profiles.find((p) => p.username.toLowerCase() === username.trim().toLowerCase());
    if (!profile) {
      throw new MockApiError(404, "Profile.NotFound", `Profile not found for username "${username}".`);
    }

    // Public view: only Published posts
    const profilePosts = db.posts
      .filter((p) => p.profileId === profile.id && p.status === PostStatus.Published)
      .sort((a, b) => {
        const timeA = new Date(a.publishedAt || a.createdAt).getTime();
        const timeB = new Date(b.publishedAt || b.createdAt).getTime();
        return timeB - timeA;
      });

    const totalCount = profilePosts.length;
    const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0;
    const pageIndex = Math.max(1, pageNumber);
    const start = (pageIndex - 1) * pageSize;
    const paginatedSlice = profilePosts.slice(start, start + pageSize);

    const mappedItems: PostSummaryResponse[] = paginatedSlice.map((post) => {
      const sortedImages = [...post.images].sort((a, b) => a.displayOrder - b.displayOrder);
      const firstImage = sortedImages[0];

      return {
        id: post.id,
        profileId: post.profileId,
        title: post.title,
        description: post.description,
        externalUrl: post.externalUrl,
        status: post.status,
        tags: post.tags,
        createdAt: post.createdAt,
        publishedAt: post.publishedAt,
        thumbnailUrl: firstImage ? firstImage.url : null,
        imageCount: post.images.length,
        creator: {
          profileId: profile.id,
          username: profile.username,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatarUrl: profile.avatarUrl,
        },
      };
    });

    return {
      items: mappedItems,
      pageNumber: pageIndex,
      pageSize,
      totalCount,
      totalPages,
      hasPreviousPage: pageIndex > 1,
      hasNextPage: pageIndex < totalPages,
    };
  }

  public async getCreatorPosts(
    username: string,
    pageNumber = 1,
    pageSize = 12,
  ): Promise<PaginatedList<PostSummaryResponse>> {
    return this.getProfilePosts(username, pageNumber, pageSize);
  }

  public async getMyPosts(
    status?: PostStatus | "all",
    pageNumber = 1,
    pageSize = 10,
  ): Promise<PaginatedList<PostSummaryResponse>> {
    await simulateNetworkLatency();
    const db = this.loadDb();
    const { profile } = this.getAuthenticatedUser(db);

    let items = db.posts.filter((p) => p.profileId === profile.id);

    if (status !== undefined && status !== "all") {
      items = items.filter((p) => p.status === status);
    }

    // Sort by latest update or creation
    items.sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt).getTime();
      return timeB - timeA;
    });

    const totalCount = items.length;
    const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0;
    const pageIndex = Math.max(1, pageNumber);
    const start = (pageIndex - 1) * pageSize;
    const paginatedSlice = items.slice(start, start + pageSize);

    const mappedItems: PostSummaryResponse[] = paginatedSlice.map((post) => {
      const sortedImages = [...post.images].sort((a, b) => a.displayOrder - b.displayOrder);
      const firstImage = sortedImages[0];

      return {
        id: post.id,
        profileId: post.profileId,
        title: post.title,
        description: post.description,
        externalUrl: post.externalUrl,
        status: post.status,
        tags: post.tags,
        createdAt: post.createdAt,
        publishedAt: post.publishedAt,
        thumbnailUrl: firstImage ? firstImage.url : null,
        imageCount: post.images.length,
        creator: {
          profileId: profile.id,
          username: profile.username,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatarUrl: profile.avatarUrl,
        },
      };
    });

    return {
      items: mappedItems,
      pageNumber: pageIndex,
      pageSize,
      totalCount,
      totalPages,
      hasPreviousPage: pageIndex > 1,
      hasNextPage: pageIndex < totalPages,
    };
  }

  public async createPost(request: CreatePostRequest): Promise<PostCreatedResponse> {
    await simulateNetworkLatency();
    const db = this.loadDb();
    const { profile } = this.getAuthenticatedUser(db);

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
    this.saveDb(db);

    return { id: postId };
  }

  public async updatePost(id: string, request: UpdatePostRequest): Promise<void> {
    await simulateNetworkLatency();
    const db = this.loadDb();
    const { profile } = this.getAuthenticatedUser(db);

    const post = db.posts.find((p) => p.id === id);
    if (!post) {
      throw new MockApiError(404, "Post.NotFound", `Post with ID "${id}" was not found.`);
    }

    if (post.profileId !== profile.id) {
      throw new MockApiError(403, "Post.UnauthorizedAccess", "You do not own this post.");
    }

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

    this.saveDb(db);
  }

  public async deletePost(id: string): Promise<void> {
    await simulateNetworkLatency();
    const db = this.loadDb();
    const { profile } = this.getAuthenticatedUser(db);

    const index = db.posts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new MockApiError(404, "Post.NotFound", `Post with ID "${id}" was not found.`);
    }

    const post = db.posts[index];
    if (post.profileId !== profile.id) {
      throw new MockApiError(403, "Post.UnauthorizedAccess", "You do not own this post.");
    }

    db.posts.splice(index, 1);
    this.saveDb(db);
  }

  public async publishPost(id: string): Promise<void> {
    await simulateNetworkLatency();
    const db = this.loadDb();
    const { profile } = this.getAuthenticatedUser(db);

    const post = db.posts.find((p) => p.id === id);
    if (!post) {
      throw new MockApiError(404, "Post.NotFound", `Post with ID "${id}" was not found.`);
    }

    if (post.profileId !== profile.id) {
      throw new MockApiError(403, "Post.UnauthorizedAccess", "You do not own this post.");
    }

    // MANDATORY BACKEND INVARIANT: Post cannot be published without at least 1 image
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

    this.saveDb(db);
  }

  public async unpublishPost(id: string): Promise<void> {
    await simulateNetworkLatency();
    const db = this.loadDb();
    const { profile } = this.getAuthenticatedUser(db);

    const post = db.posts.find((p) => p.id === id);
    if (!post) {
      throw new MockApiError(404, "Post.NotFound", `Post with ID "${id}" was not found.`);
    }

    if (post.profileId !== profile.id) {
      throw new MockApiError(403, "Post.UnauthorizedAccess", "You do not own this post.");
    }

    post.status = PostStatus.Unpublished;
    post.updatedAt = new Date().toISOString();

    this.saveDb(db);
  }

  // -------------------------------------------------------------------------
  // Post Image Upload & Management Simulation
  // -------------------------------------------------------------------------

  public async getPostImageUploadUrl(postId: string, request: UploadUrlRequest): Promise<UploadUrlResponse> {
    await simulateNetworkLatency(80, 150);
    const db = this.loadDb();
    const { profile } = this.getAuthenticatedUser(db);

    const post = db.posts.find((p) => p.id === postId);
    if (!post) {
      throw new MockApiError(404, "Post.NotFound", `Post with ID "${postId}" was not found.`);
    }

    if (post.profileId !== profile.id) {
      throw new MockApiError(403, "Post.UnauthorizedAccess", "You do not own this post.");
    }

    const ext = request.contentType.split("/")[1] || "jpg";
    const storageKey = `posts/${profile.id}/${generateUuid()}.${ext}`;
    const uploadUrl = `https://mock-r2-upload.showcase.internal/${storageKey}`;

    return { uploadUrl, storageKey };
  }

  /**
   * Simulates direct client-side upload to Cloudflare R2.
   * In the mock layer, this can convert File/Blob to a temporary object URL or data URL
   * so it renders immediately in the frontend without requiring remote storage.
   */
  public async uploadImageDirect(uploadUrl: string, file: File | Blob): Promise<string> {
    await simulateNetworkLatency(150, 350);
    if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
      return URL.createObjectURL(file);
    }
    return uploadUrl;
  }

  public async addPostImage(
    postId: string,
    storageKey: string,
    url?: string,
    displayOrder?: number,
  ): Promise<PostImageAddedResponse> {
    await simulateNetworkLatency();
    const db = this.loadDb();
    const { profile } = this.getAuthenticatedUser(db);

    const post = db.posts.find((p) => p.id === postId);
    if (!post) {
      throw new MockApiError(404, "Post.NotFound", `Post with ID "${postId}" was not found.`);
    }

    if (post.profileId !== profile.id) {
      throw new MockApiError(403, "Post.UnauthorizedAccess", "You do not own this post.");
    }

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

    this.saveDb(db);
    return { imageId };
  }

  public async removePostImage(postId: string, imageId: string): Promise<void> {
    await simulateNetworkLatency();
    const db = this.loadDb();
    const { profile } = this.getAuthenticatedUser(db);

    const post = db.posts.find((p) => p.id === postId);
    if (!post) {
      throw new MockApiError(404, "Post.NotFound", `Post with ID "${postId}" was not found.`);
    }

    if (post.profileId !== profile.id) {
      throw new MockApiError(403, "Post.UnauthorizedAccess", "You do not own this post.");
    }

    const imgIndex = post.images.findIndex((i) => i.id === imageId);
    if (imgIndex === -1) {
      throw new MockApiError(404, "PostImage.NotFound", `Post image with ID "${imageId}" was not found.`);
    }

    // MANDATORY BACKEND INVARIANT: A published post cannot delete its final remaining image
    if (post.status === PostStatus.Published && post.images.length <= 1) {
      throw new MockApiError(
        409,
        "Post.CannotRemoveLastImageFromPublishedPost",
        "Cannot remove the final remaining image from a published post. Unpublish the post first or upload a replacement.",
      );
    }

    post.images.splice(imgIndex, 1);
    post.updatedAt = new Date().toISOString();

    this.saveDb(db);
  }

  public async reorderPostImages(postId: string, request: ReorderPostImagesRequest): Promise<void> {
    await simulateNetworkLatency();
    const db = this.loadDb();
    const { profile } = this.getAuthenticatedUser(db);

    const post = db.posts.find((p) => p.id === postId);
    if (!post) {
      throw new MockApiError(404, "Post.NotFound", `Post with ID "${postId}" was not found.`);
    }

    if (post.profileId !== profile.id) {
      throw new MockApiError(403, "Post.UnauthorizedAccess", "You do not own this post.");
    }

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

    this.saveDb(db);
  }
}

export const mockService = new MockDbService();
