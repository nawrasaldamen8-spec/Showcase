using System;
using System.Collections.Generic;

namespace Showcase.Application.Features.Profiles.Common;

public record SocialLinkDto(
    Guid Id,
    string Platform,
    string Url,
    int DisplayOrder);

public record MyProfileResponse(
    Guid Id,
    string UserId,
    string Email,
    string UserName,
    string FirstName,
    string LastName,
    string? Bio,
    string? AvatarKey,
    string? AvatarUrl,
    IReadOnlyCollection<SocialLinkDto> SocialLinks,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public record PublicProfileResponse(
    Guid Id,
    string UserName,
    string FirstName,
    string LastName,
    string? Bio,
    string? AvatarUrl,
    IReadOnlyCollection<SocialLinkDto> SocialLinks);

public record AvatarUploadUrlResponse(
    string UploadUrl,
    string StorageKey);
