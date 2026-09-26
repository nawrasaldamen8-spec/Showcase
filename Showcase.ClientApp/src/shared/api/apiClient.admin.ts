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
import { httpFetch, USE_MOCK_API } from "./apiClient.base.ts";
import { mockAdminService } from "./mockService.admin.ts";

export const apiAdminClient = {
  async getDashboardMetrics(): Promise<AdminDashboardMetricsDto> {
    if (USE_MOCK_API) return mockAdminService.getDashboardMetrics();
    return httpFetch<AdminDashboardMetricsDto>("/api/admin/dashboard");
  },

  async getUsers(search?: string, status?: string, role?: string): Promise<AdminUserListItem[]> {
    if (USE_MOCK_API) return mockAdminService.getUsers(search, status, role);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    if (role) params.append("role", role);
    return httpFetch<AdminUserListItem[]>(`/api/admin/users?${params.toString()}`);
  },

  async banUser(userId: string, reason: string): Promise<void> {
    if (USE_MOCK_API) return mockAdminService.banUser(userId, reason);
    return httpFetch<void>(`/api/admin/users/${userId}/ban`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  async unbanUser(userId: string): Promise<void> {
    if (USE_MOCK_API) return mockAdminService.unbanUser(userId);
    return httpFetch<void>(`/api/admin/users/${userId}/unban`, {
      method: "POST",
    });
  },

  async updateUserRole(userId: string, roles: UserRole[]): Promise<void> {
    if (USE_MOCK_API) return mockAdminService.updateUserRole(userId, roles);
    return httpFetch<void>(`/api/admin/users/${userId}/roles`, {
      method: "PUT",
      body: JSON.stringify({ roles }),
    });
  },

  async getVerificationRequests(): Promise<VerificationRequestItem[]> {
    if (USE_MOCK_API) return mockAdminService.getVerificationRequests();
    return httpFetch<VerificationRequestItem[]>("/api/admin/verifications");
  },

  async approveVerificationRequest(requestId: string, note?: string): Promise<void> {
    if (USE_MOCK_API) return mockAdminService.approveVerificationRequest(requestId, note);
    return httpFetch<void>(`/api/admin/verifications/${requestId}/approve`, {
      method: "POST",
      body: JSON.stringify({ note }),
    });
  },

  async rejectVerificationRequest(requestId: string, note?: string): Promise<void> {
    if (USE_MOCK_API) return mockAdminService.rejectVerificationRequest(requestId, note);
    return httpFetch<void>(`/api/admin/verifications/${requestId}/reject`, {
      method: "POST",
      body: JSON.stringify({ note }),
    });
  },

  async getContentReports(status?: string): Promise<ContentReportItem[]> {
    if (USE_MOCK_API) return mockAdminService.getContentReports(status);
    const query = status ? `?status=${status}` : "";
    return httpFetch<ContentReportItem[]>(`/api/admin/reports${query}`);
  },

  async resolveReport(reportId: string, actionTaken: string): Promise<void> {
    if (USE_MOCK_API) return mockAdminService.resolveReport(reportId, actionTaken);
    return httpFetch<void>(`/api/admin/reports/${reportId}/resolve`, {
      method: "POST",
      body: JSON.stringify({ actionTaken }),
    });
  },

  async dismissReport(reportId: string): Promise<void> {
    if (USE_MOCK_API) return mockAdminService.dismissReport(reportId);
    return httpFetch<void>(`/api/admin/reports/${reportId}/dismiss`, {
      method: "POST",
    });
  },

  async getFeaturedRecommendations(): Promise<FeaturedRecommendationItem[]> {
    if (USE_MOCK_API) return mockAdminService.getFeaturedRecommendations();
    return httpFetch<FeaturedRecommendationItem[]>("/api/admin/featured");
  },

  async toggleCuratedPin(id: string, isPinned: boolean): Promise<void> {
    if (USE_MOCK_API) return mockAdminService.toggleCuratedPin(id, isPinned);
    return httpFetch<void>(`/api/admin/featured/${id}/pin`, {
      method: "PUT",
      body: JSON.stringify({ isPinned }),
    });
  },

  async approveFeaturedRequest(id: string): Promise<void> {
    if (USE_MOCK_API) return mockAdminService.approveFeaturedRequest(id);
    return httpFetch<void>(`/api/admin/featured/${id}/approve`, {
      method: "POST",
    });
  },

  async rejectFeaturedRequest(id: string): Promise<void> {
    if (USE_MOCK_API) return mockAdminService.rejectFeaturedRequest(id);
    return httpFetch<void>(`/api/admin/featured/${id}/reject`, {
      method: "POST",
    });
  },

  async getStorageTelemetry(): Promise<StorageTelemetryDto> {
    if (USE_MOCK_API) return mockAdminService.getStorageTelemetry();
    return httpFetch<StorageTelemetryDto>("/api/admin/storage");
  },

  async getAuditLogs(): Promise<AuditLogItem[]> {
    if (USE_MOCK_API) return mockAdminService.getAuditLogs();
    return httpFetch<AuditLogItem[]>("/api/admin/audit-logs");
  },

  async getBroadcasts(): Promise<BroadcastAnnouncementItem[]> {
    if (USE_MOCK_API) return mockAdminService.getBroadcasts();
    return httpFetch<BroadcastAnnouncementItem[]>("/api/admin/broadcasts");
  },

  async createBroadcast(
    item: Omit<BroadcastAnnouncementItem, "id" | "publishedAt" | "adminUsername">
  ): Promise<void> {
    if (USE_MOCK_API) return mockAdminService.createBroadcast(item);
    return httpFetch<void>("/api/admin/broadcasts", {
      method: "POST",
      body: JSON.stringify(item),
    });
  },
};
