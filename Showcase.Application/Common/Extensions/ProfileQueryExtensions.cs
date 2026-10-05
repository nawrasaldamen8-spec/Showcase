using Showcase.Application.Features.Profiles.Common;

namespace Showcase.Application.Common.Extensions;

public static class ProfileQueryExtensions
{
    public static async Task<Result<Profile>> GetActiveProfileByUserIdAsync(
        this IApplicationDbContext context,
        string? userId,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        var profile = await context.Profiles
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);

        if (profile is null)
            return ProfileErrors.NotFoundForUser(userId);

        return profile;
    }

    public static async Task<Result<Profile>> GetProfileWithCareerVisibilityAsync(
        this IApplicationDbContext context,
        string? userId,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        var profile = await context.Profiles
            .Include(p => p.CareerVisibility)
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);

        if (profile is null)
            return ProfileErrors.NotFoundForUser(userId);

        return profile;
    }

    public static async Task<Result<Profile>> GetProfileWithCareerDataAsync(
        this IApplicationDbContext context,
        string? userId,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        var profile = await context.Profiles
            .Include(p => p.Experiences)
            .Include(p => p.Academics)
            .Include(p => p.Skills)
            .Include(p => p.Credentials)
            .Include(p => p.Languages)
            .Include(p => p.Achievements)
            .Include(p => p.CareerVisibility)
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);

        if (profile is null)
            return ProfileErrors.NotFoundForUser(userId);

        return profile;
    }

    public static IQueryable<Profile> WhereActive(this IQueryable<Profile> query)
    {
        return query.Where(p => !p.IsBanned && !p.IsDeleted);
    }

    public static IQueryable<Profile> WhereFeatured(this IQueryable<Profile> query, bool? featuredOnly)
    {
        if (featuredOnly == true)
        {
            return query.Where(p => p.FeaturedStatus == FeaturedStatus.Featured);
        }

        return query;
    }

    public static IQueryable<Profile> Search(this IQueryable<Profile> query, string? term)
    {
        if (string.IsNullOrWhiteSpace(term))
            return query;

        var search = term.Trim().ToLower();
        return query.Where(p =>
            p.Name.ToLower().Contains(search) ||
            (p.Specialty != null && p.Specialty.ToLower().Contains(search)) ||
            (p.Country != null && p.Country.ToLower().Contains(search)));
    }

    public static IQueryable<Profile> FilterByStatus(this IQueryable<Profile> query, string? status)
    {
        if (string.IsNullOrWhiteSpace(status) || status.Equals("all", StringComparison.OrdinalIgnoreCase))
            return query;

        return status.ToLowerInvariant() switch
        {
            "active" => query.Where(p => !p.IsBanned && !p.IsDeleted),
            "suspended" => query.Where(p => p.IsBanned),
            _ => query
        };
    }

    public static async Task<Dictionary<string, UserIdentityDetails>> GetUserIdentitiesAsync(
        this IIdentityService identityService,
        IReadOnlyCollection<string> userIds,
        CancellationToken ct = default)
    {
        if (userIds.Count == 0)
            return new Dictionary<string, UserIdentityDetails>();

        var usersResult = await identityService.GetUsersByIdsAsync(userIds, ct);
        var usersDict = usersResult?.IsSuccess == true
            ? new Dictionary<string, UserIdentityDetails>(usersResult.Value)
            : new Dictionary<string, UserIdentityDetails>();

        foreach (var userId in userIds)
        {
            if (!usersDict.ContainsKey(userId))
            {
                var individualUser = await identityService.GetUserByIdAsync(userId, ct);
                if (individualUser?.IsSuccess == true)
                {
                    usersDict[userId] = individualUser.Value;
                }
            }
        }

        return usersDict;
    }

    public static PublicProfileResponse ToPublicResponse(
        this Profile profile,
        string username,
        IStorageService storageService)
    {
        var avatarUrl = profile.AvatarKey is not null
            ? storageService.GetPublicUrl(profile.AvatarKey.Value)
            : null;

        var socialLinks = profile.SocialLinks
            .OrderBy(x => x.DisplayOrder)
            .Select(x => new SocialLinkDto(x.Id, x.Platform, x.Url.Value, x.DisplayOrder))
            .ToList();

        return new PublicProfileResponse(
            profile.Id,
            username,
            profile.Name,
            profile.Specialty,
            profile.Country,
            profile.Bio?.Value,
            avatarUrl,
            profile.IsVerified,
            profile.VerificationStatus,
            profile.FeaturedStatus,
            socialLinks);
    }

    public static MyProfileResponse ToMyProfileResponse(
        this Profile profile,
        UserIdentityDetails user,
        IStorageService storageService)
    {
        var avatarUrl = profile.AvatarKey is not null
            ? storageService.GetPublicUrl(profile.AvatarKey.Value)
            : null;

        var socialLinks = profile.SocialLinks
            .OrderBy(x => x.DisplayOrder)
            .Select(x => new SocialLinkDto(x.Id, x.Platform, x.Url.Value, x.DisplayOrder))
            .ToList();

        return new MyProfileResponse(
            profile.Id,
            profile.UserId,
            user.Email,
            user.UserName,
            profile.Name,
            profile.Specialty,
            profile.Country,
            profile.Bio?.Value,
            profile.AvatarKey?.Value,
            avatarUrl,
            socialLinks,
            profile.IsVerified,
            profile.VerificationStatus,
            profile.FeaturedStatus,
            profile.CreatedAt,
            profile.UpdatedAt);
    }
}
