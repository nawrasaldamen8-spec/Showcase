// Visitor storage and legacy cleanup module.
// Authentication tokens are stored securely in HttpOnly SameSite=Lax Cookies by the backend.

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
  getVisitorToken,
  clear,
};
