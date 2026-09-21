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
    string FirstName,
    string LastName,
    string? AvatarUrl);

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
    PostCreatorDto? Creator);

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
    PostCreatorDto? Creator);

public record PaginatedList<T>(
    IReadOnlyList<T> Items,
    int PageNumber,
    int PageSize,
    int TotalCount,
    int TotalPages)
{
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    public static PaginatedList<T> Create(IReadOnlyList<T> items, int pageNumber, int pageSize, int totalCount)
    {
        var totalPages = pageSize > 0 ? (int)Math.Ceiling(totalCount / (double)pageSize) : 0;
        return new PaginatedList<T>(items, pageNumber, pageSize, totalCount, totalPages);
    }
}

public record PostImageUploadUrlResponse(
    string UploadUrl,
    string StorageKey);
