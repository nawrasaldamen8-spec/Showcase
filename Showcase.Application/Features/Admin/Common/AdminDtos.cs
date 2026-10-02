using System;
using System.Collections.Generic;

namespace Showcase.Application.Features.Admin.Common;

public record AdminDashboardMetricsDto(
    int TotalUsersCount,
    int ActiveCreatorsCount,
    int TotalPublishedPosts,
    int PendingVerificationsCount,
    int PendingReportsCount,
    int CuratedPinnedCount,
    long StorageUsedBytes,
    long StorageCapacityBytes,
    IReadOnlyList<AuditLogItemDto> RecentAuditLogs,
    IReadOnlyList<BroadcastAnnouncementItemDto> RecentBroadcasts);

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
    string Message,
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
    string Details,
    string Status,
    string? ActionTaken,
    DateTime CreatedAt);

public record StorageTelemetryDto(
    long TotalCapacityBytes,
    long UsedBytes,
    int TotalFilesCount,
    long MonthlyBandwidthBytes,
    int RequestsCount,
    string PlanName,
    double CreditsUsedPercent,
    StorageAssetBreakdownDto Breakdown,
    IReadOnlyList<StorageConsumerItemDto> TopConsumers);

public record StorageAssetBreakdownDto(
    long ImagesBytes,
    long DocumentsBytes,
    long ThumbnailsBytes);

public record StorageConsumerItemDto(
    string UserId,
    string Username,
    string FullName,
    string? AvatarUrl,
    long BytesUsed,
    int FilesCount);

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
