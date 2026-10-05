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
        var requests = await _context.FeaturedRequests
            .OrderByDescending(f => f.CreatedAtUtc)
            .Take(100)
            .ToListAsync(ct);

        var userIds = requests.Select(r => r.UserId).Distinct().ToList();

        var usersResult = await _identityService.GetUsersByIdsAsync(userIds, ct);
        var usersMap = usersResult.IsSuccess ? usersResult.Value : new Dictionary<string, UserIdentityDetails>();

        var profiles = await _context.Profiles
            .Where(p => userIds.Contains(p.UserId))
            .ToListAsync(ct);

        var profileMap = profiles.ToDictionary(p => p.UserId, p => p);
        var profileIds = profiles.Select(p => p.Id).ToList();

        var postCounts = await _context.Posts
            .Where(p => profileIds.Contains(p.ProfileId) && p.Status == PostStatus.Published)
            .GroupBy(p => p.ProfileId)
            .Select(g => new { ProfileId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ProfileId, x => x.Count, ct);

        var list = requests.Select(req =>
        {
            var username = usersMap.TryGetValue(req.UserId, out var user) ? user.UserName : "unknown";
            profileMap.TryGetValue(req.UserId, out var profile);
            var name = profile?.Name ?? username;
            var avatarUrl = profile?.AvatarKey is not null
                ? _storageService.GetPublicUrl(profile.AvatarKey.Value)
                : null;

            var postsCount = (profile is not null && postCounts.TryGetValue(profile.Id, out var count))
                ? count
                : 0;

            return new FeaturedRecommendationItemDto(
                req.Id,
                req.UserId,
                username,
                name,
                avatarUrl,
                profile?.Specialty,
                req.Message,
                postsCount,
                req.Status == FeaturedStatus.Featured,
                req.Status.ToString().ToLowerInvariant(),
                req.CreatedAtUtc);
        }).ToList();

        return Result.Success<IReadOnlyList<FeaturedRecommendationItemDto>>(list);
    }
}
