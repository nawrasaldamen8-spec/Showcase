using System;
using System.Collections.Generic;

namespace Showcase.Application.Features.Admin.Common;

public record AdminDashboardMetricsDto(
    int TotalUsers,
    int ActiveCreators,
    int TotalPublishedPosts,
    int PendingVerifications,
    int PendingReports,
    int FeaturedNominations,
    long StorageBytesUsed,
    double StorageQuotaPercentage);

public record AdminUserListItemDto(
    string Id,
    string Username,
    string Name,
    string? Email,
    string? AvatarUrl,
    bool IsVerified,
    string Status,
    string? BanReason,
    int PostsCount,
    long StorageUsedBytes,
    IReadOnlyList<string> Roles,
    DateTime CreatedAt);

public record VerificationRequestItemDto(
    Guid Id,
    string UserId,
    string Username,
    string Name,
    string? AvatarUrl,
    string Category,
    string Message,
    string Status,
    DateTime CreatedAt);

public record FeaturedRecommendationItemDto(
    Guid Id,
    string UserId,
    string Username,
    string Name,
    string? AvatarUrl,
    string? Specialty,
    int PostsCount,
    bool IsCuratedPin,
    string Status,
    DateTime NominatedAt);

public record ContentReportItemDto(
    Guid Id,
    string ReporterUserId,
    string ReporterUsername,
    string TargetType,
    string TargetId,
    string TargetLabel,
    string Reason,
    string Status,
    string? ActionTaken,
    DateTime CreatedAt);

public record StorageTelemetryDto(
    long TotalUsedBytes,
    long QuotaBytes,
    int TotalObjectsCount,
    IReadOnlyList<StorageBucketBreakdownDto> Buckets);

public record StorageBucketBreakdownDto(
    string BucketName,
    long BytesUsed,
    int FileCount);

public record AuditLogItemDto(
    Guid Id,
    string AdminUserId,
    string AdminUsername,
    string Action,
    string TargetType,
    string TargetId,
    string TargetLabel,
    string? Reason,
    DateTime Timestamp);

public record BroadcastAnnouncementItemDto(
    Guid Id,
    string Title,
    string Message,
    string Severity,
    string AdminUsername,
    DateTime PublishedAt,
    DateTime? ExpiresAt);
