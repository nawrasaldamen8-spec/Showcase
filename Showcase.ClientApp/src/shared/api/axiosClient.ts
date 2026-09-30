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
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

// Request Interceptor: Attach Access Token
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: 401 Silent Refresh Queue
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Skip refresh token flow if the 401 was already on the refresh endpoint or retry already happened
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/auth/refresh") &&
      !originalRequest.url?.includes("/api/auth/login")
    ) {
      const refreshToken = tokenStorage.getRefreshToken();
      const accessToken = tokenStorage.getToken();

      if (!refreshToken || !accessToken) {
        tokenStorage.clear();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("showcase:auth-expired"));
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (newAccessToken: string) => {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              resolve(axiosInstance(originalRequest));
            },
            reject: (err: unknown) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post<{ accessToken: string; refreshToken?: string }>(
          `${API_BASE_URL}/api/auth/refresh`,
          { accessToken, refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const newAccessToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken || refreshToken;

        if (newAccessToken) {
          tokenStorage.setTokens({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          });

          axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return axiosInstance(originalRequest);
        }

        tokenStorage.clear();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("showcase:auth-expired"));
        }
        processQueue(error, null);
        return Promise.reject(error);
      } catch (refreshErr) {
        tokenStorage.clear();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("showcase:auth-expired"));
        }
        processQueue(refreshErr, null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
