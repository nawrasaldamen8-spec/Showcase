using System;

namespace Showcase.Application.Features.Notifications.Common;

public record NotificationDto(
    Guid Id,
    string Type,
    string Title,
    string Message,
    Guid? SourcePostId,
    string? SourceUserId,
    string? ActorUsername,
    string? ActorName,
    string? ActorAvatarUrl,
    string? PostTitle,
    string? PostCoverUrl,
    bool IsRead,
    DateTime CreatedAtUtc);
