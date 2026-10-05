namespace Showcase.Application.Features.Profiles.Common;

public record SocialLinkDto(
    Guid Id,
    string Platform,
    string Url,
    int DisplayOrder);

public record MyProfileResponse(
    Guid Id,
    string UserId,
    string? Email,
    string Username,
    string Name,
    string? Specialty,
    string? Country,
    string? Bio,
    string? AvatarKey,
    string? AvatarUrl,
    IReadOnlyCollection<SocialLinkDto> SocialLinks,
    bool IsVerified,
    VerificationStatus VerificationStatus,
    FeaturedStatus FeaturedStatus,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public record PublicProfileResponse(
    Guid Id,
    string Username,
    string Name,
    string? Specialty,
    string? Country,
    string? Bio,
    string? AvatarUrl,
    bool IsVerified,
    VerificationStatus VerificationStatus,
    FeaturedStatus FeaturedStatus,
    IReadOnlyCollection<SocialLinkDto> SocialLinks);

public record AvatarUploadUrlResponse(
    string UploadUrl,
    string StorageKey);
