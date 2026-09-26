import type { Post, ProblemDetails, Profile, UserAccount } from "../types/index.ts";
import { INITIAL_POSTS, INITIAL_PROFILES, INITIAL_USERS } from "./mockData.ts";

const DB_STORAGE_KEY = "showcase_portfolio_db";
const AUTH_STORAGE_KEY = "showcase_auth_state";
const PERSONA_STORAGE_KEY = "showcase_active_persona";
const LIKES_STORAGE_KEY = "showcase_liked_posts";

export interface MockDatabase {
  users: UserAccount[];
  profiles: Profile[];
  posts: Post[];
}

export interface StoredAuthState {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

export function generateUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function simulateNetworkLatency(minMs = 120, maxMs = 280): Promise<void> {
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

export const mockDb = {
  loadDb(): MockDatabase {
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
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Failed to parse mock database from localStorage; reinitializing.", err);
    }

    const initialDb: MockDatabase = {
      users: [],
      profiles: [],
      posts: [],
    };
    this.saveDb(initialDb);
    return initialDb;
  },

  saveDb(db: MockDatabase): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
    }
  },

  resetDatabase(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(DB_STORAGE_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(LIKES_STORAGE_KEY);
      localStorage.setItem(PERSONA_STORAGE_KEY, "visitor");
    }
  },

  getLikedPostIds(): Set<string> {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem(LIKES_STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          return new Set(arr);
        }
      }
    } catch {
      // Fallback
    }
    return new Set();
  },

  setLikedPostIds(ids: Set<string>): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(Array.from(ids)));
    }
  },

  getActivePersona(): "visitor" | "creator" | "admin" {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(PERSONA_STORAGE_KEY);
      if (stored === "visitor" || stored === "creator" || stored === "admin") {
        return stored;
      }
    }
    return "visitor";
  },

  setActivePersona(persona: "visitor" | "creator" | "admin"): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(PERSONA_STORAGE_KEY, persona);
      window.dispatchEvent(new CustomEvent("showcase:persona-change", { detail: persona }));
    }
  },

  getStoredAuth(): StoredAuthState | null {
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

    return null;
  },

  setStoredAuth(auth: StoredAuthState | null): void {
    if (typeof window !== "undefined") {
      if (auth) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  },

  getAuthenticatedUser(db: MockDatabase): { user: UserAccount; profile: Profile } {
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
  },
};

export function paginateList<T>(
  items: T[],
  pageNumber = 1,
  pageSize = 10,
): {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
} {
  const totalCount = items.length;
  const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0;
  const pageIndex = Math.max(1, pageNumber);
  const start = (pageIndex - 1) * pageSize;
  const paginatedSlice = items.slice(start, start + pageSize);

  return {
    items: paginatedSlice,
    pageNumber: pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage: pageIndex > 1,
    hasNextPage: pageIndex < totalPages,
  };
}

