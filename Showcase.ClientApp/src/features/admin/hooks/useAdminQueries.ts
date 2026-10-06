import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, extractApiErrorMessage, queryKeys } from "@shared/api/index.ts";
import type {
  AdminDashboardMetricsDto,
  AdminUserListItem,
  AuditLogItem,
  ContentReportItem,
  FeaturedRecommendationItem,
  StorageTelemetryDto,
  UserRole,
  VerificationRequestItem,
} from "@shared/types/index.ts";

// ==========================================
// Admin Queries
// ==========================================

export function useAdminDashboardQuery() {
  return useQuery<AdminDashboardMetricsDto>({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: () => apiClient.getDashboardMetrics(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useAdminUsersQuery(search?: string, status?: string, role?: string) {
  return useQuery<AdminUserListItem[]>({
    queryKey: queryKeys.admin.users({ search, status, role }),
    queryFn: () => apiClient.getUsers(search, status, role),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useAdminVerificationsQuery() {
  return useQuery<VerificationRequestItem[]>({
    queryKey: queryKeys.admin.verifications(),
    queryFn: () => apiClient.getVerificationRequests(),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useAdminReportsQuery(status?: string) {
  return useQuery<ContentReportItem[]>({
    queryKey: queryKeys.admin.reports({ status }),
    queryFn: () => apiClient.getContentReports(status),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useAdminFeaturedQuery() {
  return useQuery<FeaturedRecommendationItem[]>({
    queryKey: queryKeys.admin.featured(),
    queryFn: () => apiClient.getFeaturedRecommendations(),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useAdminStorageQuery() {
  return useQuery<StorageTelemetryDto>({
    queryKey: queryKeys.admin.storage(),
    queryFn: () => apiClient.getStorageTelemetry(),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

export function useAdminAuditLogsQuery() {
  return useQuery<AuditLogItem[]>({
    queryKey: queryKeys.admin.auditLogs(),
    queryFn: () => apiClient.getAuditLogs(),
    staleTime: 1000 * 30, // 30 seconds
  });
}

// ==========================================
// Admin Mutations
// ==========================================

export function useBanUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      apiClient.banUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.auditLogs() });
      toast.success("User account suspended successfully.");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to ban user."));
    },
  });
}

export function useUnbanUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => apiClient.unbanUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.auditLogs() });
      toast.success("User account reinstated.");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to unban user."));
    },
  });
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      roles,
      adminPassword,
    }: {
      userId: string;
      roles: UserRole[];
      adminPassword?: string;
    }) => apiClient.updateUserRole(userId, roles, adminPassword),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.auditLogs() });
      const hasAdmin = variables.roles.includes("Admin");
      toast.success(
        hasAdmin
          ? "Admin privileges granted successfully."
          : "Admin privileges revoked successfully."
      );
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to update user role."));
    },
  });
}

export function useToggleUserVerificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      isVerified,
      note,
    }: {
      userId: string;
      isVerified: boolean;
      note?: string;
    }) => apiClient.toggleUserVerification(userId, isVerified, note),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.verifications() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
      toast.success(
        variables.isVerified
          ? "Verified checkmark badge granted."
          : "Verified checkmark badge revoked."
      );
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to update verification status."));
    },
  });
}

export function useApproveVerificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, note }: { requestId: string; note?: string }) =>
      apiClient.approveVerificationRequest(requestId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.verifications() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
      toast.success("Official verification checkmark badge granted.");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to approve verification request."));
    },
  });
}

export function useRejectVerificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, note }: { requestId: string; note?: string }) =>
      apiClient.rejectVerificationRequest(requestId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.verifications() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
      toast.info("Verification application declined.");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to reject verification request."));
    },
  });
}

export function useResolveReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, actionTaken }: { reportId: string; actionTaken: string }) =>
      apiClient.resolveReport(reportId, actionTaken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.reports() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
      toast.success("Report resolved and corrective moderation action recorded.");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to resolve report."));
    },
  });
}

export function useDismissReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => apiClient.dismissReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.reports() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
      toast.info("Report dismissed.");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to dismiss report."));
    },
  });
}

export function useToggleCuratedPinMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) =>
      apiClient.toggleCuratedPin(id, isPinned),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.featured() });
      toast.success(
        variables.isPinned
          ? "Creator pinned to curated spotlight."
          : "Creator unpinned from curated spotlight."
      );
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to update spotlight pin status."));
    },
  });
}

export function useApproveFeaturedMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.approveFeaturedRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.featured() });
      toast.success("Approved for discovery recommendations.");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to approve featured recommendation."));
    },
  });
}

export function useRejectFeaturedMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.rejectFeaturedRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.featured() });
      toast.info("Featured request declined.");
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to decline featured request."));
    },
  });
}
