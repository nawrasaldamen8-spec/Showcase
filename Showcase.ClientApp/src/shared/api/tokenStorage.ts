const AUTH_STORAGE_KEY = "showcase_auth_token";
const REFRESH_TOKEN_KEY = "showcase_refresh_token";

export interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
}

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_STORAGE_KEY);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_STORAGE_KEY, token);
};

export const setTokens = (tokens: StoredTokens): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_STORAGE_KEY, tokens.accessToken);
  if (tokens.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
};

const VISITOR_STORAGE_KEY = "showcase_visitor_token";

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
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const tokenStorage = {
  getToken,
  getRefreshToken,
  setToken,
  setTokens,
  clear,
  getVisitorToken,
};
