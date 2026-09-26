import type {
  AuthResponse,
  ChangeEmailRequest,
  ChangePasswordRequest,
  ChangeUsernameRequest,
  CurrentUserResponse,
  LoginRequest,
  Profile,
  RegisterRequest,
  UserAccount,
} from "../types/index.ts";
import { generateUuid, MockApiError, mockDb, simulateNetworkLatency } from "./mockDb.ts";

export const mockAuthService = {
  async register(request: RegisterRequest): Promise<AuthResponse> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();

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
      bio: request.bio ? request.bio.trim() : null,
      avatarKey: null,
      avatarUrl: request.avatarUrl || null,
      createdAt: now,
      updatedAt: null,
      socialLinks: [],
    };

    db.users.push(newUser);
    db.profiles.push(newProfile);
    mockDb.saveDb(db);

    const authResponse: AuthResponse = {
      accessToken: `mock_jwt_${userId}_${Date.now()}`,
      refreshToken: `mock_refresh_${userId}_${Date.now()}`,
      expiry: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    mockDb.setStoredAuth({
      userId,
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
    });
    mockDb.setActivePersona("creator");

    return authResponse;
  },

  async login(request: LoginRequest): Promise<AuthResponse> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();

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

    mockDb.setStoredAuth({
      userId: user.id,
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
    });
    mockDb.setActivePersona("creator");

    return authResponse;
  },

  async logout(): Promise<void> {
    await simulateNetworkLatency(50, 100);
    mockDb.setStoredAuth(null);
    mockDb.setActivePersona("visitor");
  },

  async getCurrentUser(): Promise<CurrentUserResponse | null> {
    await simulateNetworkLatency(80, 150);
    if (mockDb.getActivePersona() === "visitor") {
      return null;
    }

    const db = mockDb.loadDb();
    try {
      const { user, profile } = mockDb.getAuthenticatedUser(db);
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        profileId: profile.id,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        phoneNumber: profile.phoneNumber || user.phoneNumber,
        accountNumber: profile.accountNumber || user.accountNumber,
        isVerified: profile.isVerified ?? user.isVerified ?? false,
        verificationStatus: profile.verificationStatus ?? user.verificationStatus ?? "none",
        featuredStatus: profile.featuredStatus ?? user.featuredStatus ?? "none",
        roles: user.roles,
      };
    } catch {
      return null;
    }
  },

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { user } = mockDb.getAuthenticatedUser(db);

    if (user.passwordHash !== request.currentPassword) {
      throw new MockApiError(400, "Bad Request", "Current password does not match.");
    }

    if (!request.newPassword || request.newPassword.length < 6) {
      throw new MockApiError(400, "Bad Request", "New password must be at least 6 characters long.");
    }

    user.passwordHash = request.newPassword;
    mockDb.saveDb(db);
  },

  async changeEmail(request: ChangeEmailRequest): Promise<void> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { user, profile } = mockDb.getAuthenticatedUser(db);

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
    mockDb.saveDb(db);
  },

  async changeUsername(request: ChangeUsernameRequest): Promise<void> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { user, profile } = mockDb.getAuthenticatedUser(db);

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
    mockDb.saveDb(db);
  },
};
