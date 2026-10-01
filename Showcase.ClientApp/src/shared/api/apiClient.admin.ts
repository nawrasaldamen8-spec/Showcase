import type {
  AdminDashboardMetricsDto,
  AdminUserListItem,
  AuditLogItem,
  BroadcastAnnouncementItem,
  ContentReportItem,
  FeaturedRecommendationItem,
  StorageTelemetryDto,
  UserRole,
  VerificationRequestItem,
} from "../types/index.ts";
import { httpFetch } from "./apiClient.base.ts";

export const apiAdminClient = {
  async getDashboardMetrics(): Promise<AdminDashboardMetricsDto> {
    return httpFetch<AdminDashboardMetricsDto>("/api/admin/dashboard");
  },

  async getUsers(search?: string, status?: string, role?: string): Promise<AdminUserListItem[]> {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    if (role) params.append("role", role);
    return httpFetch<AdminUserListItem[]>(`/api/admin/users?${params.toString()}`);
  },

  async banUser(userId: string, reason: string): Promise<void> {
    return httpFetch<void>(`/api/admin/users/${userId}/ban`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  async unbanUser(userId: string): Promise<void> {
    return httpFetch<void>(`/api/admin/users/${userId}/unban`, {
      method: "POST",
    });
  },

  async updateUserRole(userId: string, roles: UserRole[], adminPassword?: string): Promise<void> {
    return httpFetch<void>(`/api/admin/users/${userId}/roles`, {
      method: "PUT",
      body: JSON.stringify({ roles, adminPassword }),
    });
  },

  async toggleUserVerification(userId: string, isVerified: boolean, note?: string): Promise<void> {
    return httpFetch<void>(`/api/admin/users/${userId}/verification`, {
      method: "POST",
      body: JSON.stringify({ isVerified, note }),
    });
  },

  async getVerificationRequests(): Promise<VerificationRequestItem[]> {
    return httpFetch<VerificationRequestItem[]>("/api/admin/verifications");
  },

  async approveVerificationRequest(requestId: string, note?: string): Promise<void> {
    return httpFetch<void>(`/api/admin/verifications/${requestId}/approve`, {
      method: "POST",
      body: JSON.stringify({ note }),
    });
  },

  async rejectVerificationRequest(requestId: string, note?: string): Promise<void> {
    return httpFetch<void>(`/api/admin/verifications/${requestId}/reject`, {
      method: "POST",
      body: JSON.stringify({ note }),
    });
  },

  async getContentReports(status?: string): Promise<ContentReportItem[]> {
    const query = status ? `?status=${status}` : "";
    return httpFetch<ContentReportItem[]>(`/api/admin/reports${query}`);
  },

  async resolveReport(reportId: string, actionTaken: string): Promise<void> {
    return httpFetch<void>(`/api/admin/reports/${reportId}/resolve`, {
      method: "POST",
      body: JSON.stringify({ actionTaken }),
    });
  },

  async dismissReport(reportId: string): Promise<void> {
    return httpFetch<void>(`/api/admin/reports/${reportId}/dismiss`, {
      method: "POST",
    });
  },

  async getFeaturedRecommendations(): Promise<FeaturedRecommendationItem[]> {
    return httpFetch<FeaturedRecommendationItem[]>("/api/admin/featured");
  },

  async toggleCuratedPin(id: string, isPinned: boolean): Promise<void> {
    return httpFetch<void>(`/api/admin/featured/${id}/pin`, {
      method: "PUT",
      body: JSON.stringify({ isPinned }),
    });
  },

  async approveFeaturedRequest(id: string): Promise<void> {
    return httpFetch<void>(`/api/admin/featured/${id}/approve`, {
      method: "POST",
    });
  },

  async rejectFeaturedRequest(id: string): Promise<void> {
    return httpFetch<void>(`/api/admin/featured/${id}/reject`, {
      method: "POST",
    });
  },

  async getStorageTelemetry(): Promise<StorageTelemetryDto> {
    return httpFetch<StorageTelemetryDto>("/api/admin/storage");
  },

  async getAuditLogs(): Promise<AuditLogItem[]> {
    return httpFetch<AuditLogItem[]>("/api/admin/audit-logs");
  },

  async getBroadcasts(): Promise<BroadcastAnnouncementItem[]> {
    return httpFetch<BroadcastAnnouncementItem[]>("/api/admin/broadcasts");
  },

  async createBroadcast(
    item: Omit<BroadcastAnnouncementItem, "id" | "publishedAt" | "adminUsername">
  ): Promise<void> {
    return httpFetch<void>("/api/admin/broadcasts", {
      method: "POST",
      body: JSON.stringify(item),
    });
  },
};
