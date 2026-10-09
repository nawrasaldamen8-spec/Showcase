using Showcase.Application.Features.Admin.Common;

namespace Showcase.Application.Features.Admin.Verifications;

public record GetVerificationRequestsQuery : IRequest<Result<IReadOnlyList<VerificationRequestItemDto>>>;

public class GetVerificationRequestsQueryHandler(
    IApplicationDbContext context,
    IIdentityService identityService,
    IStorageService storageService) : IRequestHandler<GetVerificationRequestsQuery, Result<IReadOnlyList<VerificationRequestItemDto>>>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IIdentityService _identityService = identityService;
    private readonly IStorageService _storageService = storageService;

    public async Task<Result<IReadOnlyList<VerificationRequestItemDto>>> Handle(GetVerificationRequestsQuery request, CancellationToken ct)
    {
        // 1. Fetch all existing verification requests
        var allRequests = await _context.VerificationRequests
            .OrderByDescending(v => v.CreatedAtUtc)
            .ToListAsync(ct);

        // Deduplicate requests by UserId (keep newest)
        var latestRequestsByUser = allRequests
            .GroupBy(r => r.UserId)
            .ToDictionary(g => g.Key, g => g.First());

        // 2. Also fetch all actively verified profiles
        var activelyVerifiedProfiles = await _context.Profiles
            .IgnoreQueryFilters()
            .Where(p => !p.IsDeleted && p.IsVerified)
            .ToListAsync(ct);

        // 3. Union all relevant user IDs
        var userIds = latestRequestsByUser.Keys
            .Union(activelyVerifiedProfiles.Select(p => p.UserId))
            .Distinct()
            .ToList();

        if (userIds.Count == 0)
        {
            return Result.Success<IReadOnlyList<VerificationRequestItemDto>>(Array.Empty<VerificationRequestItemDto>());
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
        var list = new List<VerificationRequestItemDto>();

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

            var isVerified = profile != null
                ? profile.IsVerified
                : (req is not null && req.Status == VerificationStatus.Verified);

            var statusStr = isVerified
                ? "verified"
                : (req is not null ? req.Status.ToString().ToLowerInvariant() : "none");

            var message = req?.Message ?? "Directly verified creator.";
            var category = req?.Category ?? "professional";
            var id = req?.Id ?? (profile is not null ? profile.Id : Guid.NewGuid());
            var createdAt = req?.CreatedAtUtc ?? (profile?.CreatedAt ?? DateTime.UtcNow);
            var decisionNote = req?.AdminNotes;

            list.Add(new VerificationRequestItemDto(
                id,
                userId,
                username,
                name,
                avatarUrl,
                category,
                message,
                statusStr,
                createdAt,
                isVerified,
                profile?.Specialty,
                postsCount,
                decisionNote));
        }

        // Sort: Pending first, then Verified, then by date descending
        var sortedList = list
            .OrderByDescending(x => x.Status == "pending")
            .ThenByDescending(x => x.IsVerified)
            .ThenByDescending(x => x.CreatedAt)
            .Take(100)
            .ToList();

        return Result.Success<IReadOnlyList<VerificationRequestItemDto>>(sortedList);
    }
}
