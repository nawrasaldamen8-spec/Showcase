import type {
  AuthResponse,
  ChangeEmailRequest,
  ChangePasswordRequest,
  ChangeUsernameRequest,
  CurrentUserResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/index.ts";
import { httpFetch, USE_MOCK_API } from "./apiClient.base.ts";
import { mockService } from "./mockService.ts";

export const apiAuthClient = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    if (USE_MOCK_API) {
      return mockService.register(data);
    }
    return httpFetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: false,
    });
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    if (USE_MOCK_API) {
      return mockService.login(data);
    }
    return httpFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: false,
    });
  },

  async logout(): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.logout();
    }
    return httpFetch<void>("/api/auth/logout", { method: "POST" });
  },

  async getCurrentUser(): Promise<CurrentUserResponse | null> {
    if (USE_MOCK_API) {
      return mockService.getCurrentUser();
    }
    try {
      return await httpFetch<CurrentUserResponse>("/api/auth/me");
    } catch {
      return null;
    }
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.changePassword(data);
    }
    return httpFetch<void>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async changeEmail(data: ChangeEmailRequest): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.changeEmail(data);
    }
    return httpFetch<void>("/api/auth/change-email", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async changeUsername(data: ChangeUsernameRequest): Promise<void> {
    if (USE_MOCK_API) {
      return mockService.changeUsername(data);
    }
    return httpFetch<void>("/api/auth/change-username", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getActivePersona(): "visitor" | "creator" | "admin" {
    return mockService.getActivePersona();
  },

  async switchPersona(persona: "visitor" | "creator" | "admin"): Promise<void> {
    mockService.setActivePersona(persona);
  },

  resetDatabase(): void {
    mockService.resetDatabase();
  },
};
