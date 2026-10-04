using System;
using System.Collections.Generic;

namespace Showcase.Application.Features.Posts.Common;

public record PostImageDto(
    Guid Id,
    string StorageKey,
    string Url,
    int DisplayOrder);

public record PostCreatorDto(
    Guid ProfileId,
    string Username,
    string Name,
    string? AvatarUrl);

public record PostCreatedResponse(
    Guid Id);

public record PostResponse(
    Guid Id,
    Guid ProfileId,
    string Title,
    string Description,
    string? ExternalUrl,
    string Status,
    DateTime CreatedAt,
    DateTime? PublishedAt,
    DateTime? UpdatedAt,
    IReadOnlyCollection<PostImageDto> Images,
    IReadOnlyCollection<string> Tags,
    PostCreatorDto? Creator,
    int LikeCount = 0,
    bool IsLiked = false);

public record PostSummaryResponse(
    Guid Id,
    Guid ProfileId,
    string Title,
    string Description,
    string? ExternalUrl,
    string Status,
    DateTime CreatedAt,
    DateTime? PublishedAt,
    string? ThumbnailUrl,
    int ImageCount,
    IReadOnlyCollection<string> Tags,
    PostCreatorDto? Creator,
    int LikeCount = 0,
    bool IsLiked = false);

public record PostImageUploadUrlResponse(
    string UploadUrl,
    string StorageKey);
