import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "./tokenStorage.ts";

export const API_BASE_URL = typeof window !== "undefined" ? import.meta.env.VITE_API_URL || "" : "";

export interface ApiProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

export function extractApiErrorMessage(error: unknown, fallback = "An unexpected error occurred"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiProblemDetails | string | undefined;

    if (typeof data === "string" && data.trim()) {
      return data;
    }

    if (data && typeof data === "object") {
      if (data.errors && typeof data.errors === "object") {
        const firstErrorKey = Object.keys(data.errors)[0];
        if (firstErrorKey) {
          const msgs = data.errors[firstErrorKey];
          if (Array.isArray(msgs) && msgs.length > 0 && typeof msgs[0] === "string") {
            return msgs[0];
          }
        }
      }

      if (data.detail && typeof data.detail === "string") {
        return data.detail;
      }

      if (data.title && typeof data.title === "string") {
        return data.title;
      }
    }

    if (error.response?.status === 401) {
      return fallback !== "An unexpected error occurred"
        ? fallback
        : "Invalid username/email or password.";
    }

    if (error.response?.status === 403) {
      return "You do not have permission to perform this action.";
    }

    if (error.response?.status === 404) {
      return "The requested resource could not be found.";
    }

    if (error.message && !error.message.startsWith("Request failed with status code")) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message && !error.message.startsWith("Request failed with status code")) {
    return error.message;
  }

  return fallback;
}

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
}

// Response Interceptor: 401 Silent Refresh Queue via HttpOnly Cookies
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Skip refresh token flow if the 401 was already on the refresh/login/logout endpoints or retry already happened
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/auth/refresh") &&
      !originalRequest.url?.includes("/api/auth/login") &&
      !originalRequest.url?.includes("/api/auth/logout")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => {
              resolve(axiosInstance(originalRequest));
            },
            reject: (err: unknown) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );

        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        tokenStorage.clear();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("showcase:auth-expired"));
        }
        processQueue(refreshErr);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
