import type {
  AuthResponse,
  ChangeEmailRequest,
  ChangePasswordRequest,
  ChangeUsernameRequest,
  CurrentUserResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/index.ts";
import { httpFetch } from "./apiClient.base.ts";
import { tokenStorage } from "./tokenStorage.ts";

export const apiAuthClient = {
  async checkUsernameAvailability(username: string): Promise<boolean> {
    const res = await httpFetch<{ available: boolean }>(
      `/api/auth/check-username?username=${encodeURIComponent(username)}`,
      { requiresAuth: false }
    );
    return res.available;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await httpFetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: false,
    });
    if (res.accessToken) {
      tokenStorage.setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    }
    return res;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await httpFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: false,
    });
    if (res.accessToken) {
      tokenStorage.setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    }
    return res;
  },

  async refreshToken(accessToken: string, refreshToken: string): Promise<AuthResponse> {
    const res = await httpFetch<AuthResponse>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ accessToken, refreshToken }),
      requiresAuth: false,
    });
    if (res.accessToken) {
      tokenStorage.setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    }
    return res;
  },

  async logout(): Promise<void> {
    try {
      await httpFetch<void>("/api/auth/logout", { method: "POST" });
    } finally {
      tokenStorage.clear();
    }
  },

  async getCurrentUser(): Promise<CurrentUserResponse | null> {
    if (!tokenStorage.getToken()) {
      return null;
    }
    try {
      return await httpFetch<CurrentUserResponse>("/api/auth/me");
    } catch {
      return null;
    }
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return httpFetch<void>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async changeEmail(data: ChangeEmailRequest): Promise<void> {
    return httpFetch<void>("/api/auth/change-email", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async changeUsername(data: ChangeUsernameRequest): Promise<void> {
    return httpFetch<void>("/api/auth/change-username", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

