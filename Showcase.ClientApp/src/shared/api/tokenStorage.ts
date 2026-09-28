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
};
