import { tokenStorage } from "./tokenStorage.ts";

export const USE_MOCK_API = false;

export const API_BASE_URL = typeof window !== "undefined" ? import.meta.env.VITE_API_URL || "" : "";

export interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function httpFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.requiresAuth !== false) {
    const token = tokenStorage.getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { title: response.statusText, status: response.status };
    }
    throw errorBody;
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
