import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { authSyncService } from "../services/authSyncService.ts";
import type { ProblemDetails } from "../types/index.ts";

export const API_BASE_URL = typeof window !== "undefined" ? import.meta.env.VITE_API_URL || "" : "";

export type ApiProblemDetails = ProblemDetails;

export function extractApiProblemDetails(error: unknown): ProblemDetails | null {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === "object") {
      return data as ProblemDetails;
    }
  }
  return null;
}

export function extractApiFieldErrors(error: unknown): Record<string, string> {
  const problem = extractApiProblemDetails(error);
  if (!problem?.errors || typeof problem.errors !== "object") {
    return {};
  }

  const fieldErrors: Record<string, string> = {};
  for (const [key, messages] of Object.entries(problem.errors)) {
    if (Array.isArray(messages) && messages.length > 0 && typeof messages[0] === "string") {
      const msg = messages[0];
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      fieldErrors[camelKey] = msg;
      fieldErrors[key] = msg;
    }
  }
  return fieldErrors;
}

export function extractApiErrorMessage(error: unknown, fallback = "An unexpected error occurred"): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      return "Network connection error. Please check your internet connection.";
    }

    if (error.code === "ECONNABORTED") {
      return "The request timed out. Please try again.";
    }

    const data = error.response?.data as ApiProblemDetails | string | undefined;

    if (typeof data === "string" && data.trim()) {
      return data.trim();
    }

    if (data && typeof data === "object") {
      if (data.detail && typeof data.detail === "string" && data.detail.trim()) {
        return data.detail.trim();
      }

      if (data.errors && typeof data.errors === "object") {
        for (const key of Object.keys(data.errors)) {
          const msgs = data.errors[key];
          if (Array.isArray(msgs) && msgs.length > 0 && typeof msgs[0] === "string" && msgs[0].trim()) {
            return msgs[0].trim();
          }
        }
      }

      if (data.title && typeof data.title === "string" && data.title.trim()) {
        return data.title.trim();
      }
    }

    const status = error.response?.status;
    if (status === 401) {
      return fallback !== "An unexpected error occurred"
        ? fallback
        : "Invalid username/email or password.";
    }

    if (status === 403) {
      return "You do not have permission to perform this action.";
    }

    if (status === 404) {
      return "The requested resource could not be found.";
    }

    if (status === 409) {
      return "A conflict occurred with existing data.";
    }

    if (status === 422) {
      return "Unable to process the submitted data.";
    }

    if (status === 500) {
      return "Internal server error. Please try again later.";
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

// Response Interceptor: 401 Silent Refresh Queue via HttpOnly Cookies & authSyncService
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
      if (authSyncService.isRefreshing()) {
        return new Promise((resolve, reject) => {
          authSyncService.enqueue(
            () => resolve(axiosInstance(originalRequest)),
            (err: unknown) => reject(err)
          );
        });
      }

      originalRequest._retry = true;
      authSyncService.setRefreshing(true);

      try {
        await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );

        authSyncService.notifyRefreshSuccess();
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        authSyncService.notifyAuthExpired(refreshErr);
        return Promise.reject(refreshErr);
      } finally {
        authSyncService.setRefreshing(false);
      }
    }

    return Promise.reject(error);
  }
);
