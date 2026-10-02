// Tokens are now stored securely in HttpOnly SameSite=Lax Cookies by the backend.
// This module provides backward compatibility and cleans any legacy tokens from localStorage.

const AUTH_STORAGE_KEY = "showcase_auth_token";
const REFRESH_TOKEN_KEY = "showcase_refresh_token";
const VISITOR_STORAGE_KEY = "showcase_visitor_token";

// Auto-cleanup legacy tokens if they exist in browser storage
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Ignore storage restrictions
  }
}

export interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
}

export const getToken = (): string | null => {
  return null;
};

export const getRefreshToken = (): string | null => {
  return null;
};

export const setToken = (_token: string): void => {
  // No-op: cookies are managed by the browser
};

export const setTokens = (_tokens: StoredTokens): void => {
  // No-op: cookies are managed by the browser
};

export const getVisitorToken = (): string => {
  if (typeof window === "undefined") return "";
  let token = localStorage.getItem(VISITOR_STORAGE_KEY);
  if (!token) {
    token = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(VISITOR_STORAGE_KEY, token);
  }
  return token;
};

export const clear = (): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Ignore
  }
};

export const tokenStorage = {
  getToken,
  getRefreshToken,
  setToken,
  setTokens,
  clear,
  getVisitorToken,
};

