import { axiosInstance, extractApiErrorMessage, type ApiProblemDetails } from "./axiosClient.ts";

export const USE_MOCK_API = false;
export const API_BASE_URL = typeof window !== "undefined" ? import.meta.env.VITE_API_URL || "" : "";

export interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | string;
  headers?: Record<string, string> | Headers;
  body?: string | FormData | unknown;
  requiresAuth?: boolean;
}

export { extractApiErrorMessage, axiosInstance };
export type { ApiProblemDetails };

export async function httpFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  let headers: Record<string, string> = {};
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((val, key) => {
        headers[key] = val;
      });
    } else {
      headers = { ...options.headers };
    }
  }

  if (options.requiresAuth === false) {
    delete headers["Authorization"];
  }

  let data: unknown = options.body;
  if (typeof options.body === "string") {
    try {
      data = JSON.parse(options.body);
    } catch {
      data = options.body;
    }
  }

  try {
    const res = await axiosInstance.request<T>({
      url,
      method,
      headers,
      data,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}
