using Showcase.Application.Features.Admin.Common;

namespace Showcase.Application.Features.Admin.Featured;

public record GetFeaturedRecommendationsQuery : IRequest<Result<IReadOnlyList<FeaturedRecommendationItemDto>>>;

public class GetFeaturedRecommendationsQueryHandler(
    IApplicationDbContext context,
    IIdentityService identityService,
    IStorageService storageService) : IRequestHandler<GetFeaturedRecommendationsQuery, Result<IReadOnlyList<FeaturedRecommendationItemDto>>>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IIdentityService _identityService = identityService;
    private readonly IStorageService _storageService = storageService;

    public async Task<Result<IReadOnlyList<FeaturedRecommendationItemDto>>> Handle(GetFeaturedRecommendationsQuery request, CancellationToken ct)
    {
        // 1. Fetch all existing requests
        var allRequests = await _context.FeaturedRequests
            .OrderByDescending(f => f.CreatedAtUtc)
            .ToListAsync(ct);

        // Deduplicate requests by UserId (keep newest)
        var latestRequestsByUser = allRequests
            .GroupBy(r => r.UserId)
            .ToDictionary(g => g.Key, g => g.First());

        // 2. Also fetch all actively featured profiles to ensure direct admin features are included
        var activelyFeaturedProfiles = await _context.Profiles
            .IgnoreQueryFilters()
            .Where(p => !p.IsDeleted && p.FeaturedStatus == FeaturedStatus.Featured)
            .ToListAsync(ct);

        // 3. Union all relevant user IDs
        var userIds = latestRequestsByUser.Keys
            .Union(activelyFeaturedProfiles.Select(p => p.UserId))
            .Distinct()
            .ToList();

        if (userIds.Count == 0)
        {
            return Result.Success<IReadOnlyList<FeaturedRecommendationItemDto>>(Array.Empty<FeaturedRecommendationItemDto>());
        }

        // 4. Batch Lookups for Users, Profiles, and Post Counts
        var usersResult = await _identityService.GetUsersByIdsAsync(userIds, ct);
        var usersMap = usersResult.IsSuccess ? usersResult.Value : new Dictionary<string, UserIdentityDetails>();

        var allRelevantProfiles = await _context.Profiles
            .IgnoreQueryFilters()
            .Where(p => userIds.Contains(p.UserId) && !p.IsDeleted)
            .ToListAsync(ct);

        var profileMap = allRelevantProfiles.ToDictionary(p => p.UserId, p => p);
        var profileIds = allRelevantProfiles.Select(p => p.Id).ToList();

        var postCounts = await _context.Posts
            .Where(p => profileIds.Contains(p.ProfileId) && p.Status == PostStatus.Published)
            .GroupBy(p => p.ProfileId)
            .Select(g => new { ProfileId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ProfileId, x => x.Count, ct);

        // 5. Build Unified Result List
        var list = new List<FeaturedRecommendationItemDto>();

        foreach (var userId in userIds)
        {
            var hasRequest = latestRequestsByUser.TryGetValue(userId, out var req);
            profileMap.TryGetValue(userId, out var profile);
            var username = usersMap.TryGetValue(userId, out var user) ? user.UserName : "unknown";
            var name = profile?.Name ?? username;
            var avatarUrl = profile?.AvatarKey is not null
                ? _storageService.GetPublicUrl(profile.AvatarKey.Value)
                : null;

            var postsCount = (profile is not null && postCounts.TryGetValue(profile.Id, out var count))
                ? count
                : 0;

            var isPinned = (profile is not null && profile.FeaturedStatus == FeaturedStatus.Featured)
                || (req is not null && req.Status == FeaturedStatus.Featured);

            var statusStr = isPinned
                ? "featured"
                : (req is not null ? req.Status.ToString().ToLowerInvariant() : "none");

            var message = req?.Message ?? "Curated spotlight recommendation.";
            var id = req?.Id ?? (profile is not null ? profile.Id : Guid.NewGuid());
            var createdAt = req?.CreatedAtUtc ?? (profile?.CreatedAt ?? DateTime.UtcNow);

            list.Add(new FeaturedRecommendationItemDto(
                id,
                userId,
                username,
                name,
                avatarUrl,
                profile?.Specialty,
                message,
                postsCount,
                isPinned,
                statusStr,
                createdAt));
        }

        // Sort: Pinned first, then by date descending
        var sortedList = list
            .OrderByDescending(x => x.IsCuratedPin)
            .ThenByDescending(x => x.NominatedAt)
            .Take(100)
            .ToList();

        return Result.Success<IReadOnlyList<FeaturedRecommendationItemDto>>(sortedList);
    }
}
