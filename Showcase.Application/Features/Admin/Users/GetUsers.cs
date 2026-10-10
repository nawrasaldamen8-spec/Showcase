using Showcase.Application.Features.Admin.Common;

namespace Showcase.Application.Features.Admin.Users;

public record GetUsersQuery(
    string? Search = null,
    string? Status = null,
    string? Role = null) : IRequest<Result<IReadOnlyList<AdminUserListItemDto>>>;

public class GetUsersQueryHandler(
    IApplicationDbContext context,
    IIdentityService identityService,
    IStorageService storageService) : IRequestHandler<GetUsersQuery, Result<IReadOnlyList<AdminUserListItemDto>>>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IIdentityService _identityService = identityService;
    private readonly IStorageService _storageService = storageService;

    // Statistical approximation: ~850 KB per high-resolution architectural plate.
    // Actual file sizes are not stored in post_images; this is a display estimate only.
    private const long ApproximateBytesPerPost = 850_000L;

    public async Task<Result<IReadOnlyList<AdminUserListItemDto>>> Handle(GetUsersQuery request, CancellationToken ct)
    {
        var profiles = await _context.Profiles
            .IgnoreQueryFilters()
            .Where(p => !p.IsDeleted)
            .Search(request.Search)
            .FilterByStatus(request.Status)
            .OrderByDescending(p => p.CreatedAt)
            .Take(100)
            .ToListAsync(ct);

        // 1. Batch Identity Lookups
        var userIds = profiles.Select(p => p.UserId).Distinct().ToList();
        var usersResult = await _identityService.GetUsersByIdsAsync(userIds, ct);
        var usersMap = usersResult.IsSuccess
            ? usersResult.Value
            : new Dictionary<string, UserIdentityDetails>();

        // 2. Batch Post & Image Counts (Eliminates N+1 query)
        var profileIds = profiles.Select(p => p.Id).ToList();
        var postCounts = await _context.Posts
            .Where(p => profileIds.Contains(p.ProfileId) && p.Status == PostStatus.Published)
            .GroupBy(p => p.ProfileId)
            .Select(g => new { ProfileId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ProfileId, x => x.Count, ct);

        var imageCounts = await _context.PostImages
            .Join(_context.Posts, img => img.PostId, post => post.Id, (img, post) => new { img, post.ProfileId })
            .Where(x => profileIds.Contains(x.ProfileId))
            .GroupBy(x => x.ProfileId)
            .Select(g => new { ProfileId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ProfileId, x => x.Count, ct);

        // 3. Domain Projection & In-Memory Role Filter
        var filterByRole = !string.IsNullOrWhiteSpace(request.Role) && !request.Role.Equals("all", StringComparison.OrdinalIgnoreCase);

        var list = profiles
            .Select(profile =>
            {
                usersMap.TryGetValue(profile.UserId, out var user);
                var roles = user?.Roles?.ToList() ?? new List<string>();
                var postsCount = postCounts.GetValueOrDefault(profile.Id, 0);
                var totalImages = imageCounts.GetValueOrDefault(profile.Id, 0);
                var avatarBytes = profile.AvatarKey is not null ? 350_000L : 0L;
                var storageUsedBytes = (totalImages * ApproximateBytesPerPost) + avatarBytes;
                var avatarUrl = profile.AvatarKey is not null ? _storageService.GetPublicUrl(profile.AvatarKey.Value) : null;

                return new
                {
                    Profile = profile,
                    User = user,
                    Roles = roles,
                    PostsCount = postsCount,
                    StorageUsedBytes = storageUsedBytes,
                    AvatarUrl = avatarUrl
                };
            })
            .Where(x => !filterByRole || x.Roles.Contains(request.Role!, StringComparer.OrdinalIgnoreCase))
            .Select(x => new AdminUserListItemDto(
                x.Profile.UserId,
                x.User?.UserName ?? "unknown",
                x.Profile.Name,
                x.User?.Email,
                x.AvatarUrl,
                x.Profile.IsVerified,
                x.Profile.IsBanned ? "suspended" : "active",
                x.Profile.BanReason,
                x.PostsCount,
                x.StorageUsedBytes,
                x.Roles.ToList(),
                x.Profile.CreatedAt,
                x.Profile.FeaturedStatus == FeaturedStatus.Featured,
                x.Profile.FeaturedStatus.ToString().ToLowerInvariant()))
            .ToList();

        return list;
    }
}
