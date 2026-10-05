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
        var requests = await _context.VerificationRequests
            .OrderByDescending(v => v.CreatedAtUtc)
            .Take(100)
            .ToListAsync(ct);

        var userIds = requests.Select(r => r.UserId).Distinct().ToList();

        var usersResult = await _identityService.GetUsersByIdsAsync(userIds, ct);
        var usersDict = usersResult.IsSuccess ? usersResult.Value : new Dictionary<string, UserIdentityDetails>();

        var profiles = await _context.Profiles
            .Where(p => userIds.Contains(p.UserId))
            .ToDictionaryAsync(p => p.UserId, ct);

        var list = requests.Select(req =>
        {
            var username = usersDict.TryGetValue(req.UserId, out var u) ? u.UserName : "unknown";
            profiles.TryGetValue(req.UserId, out var profile);

            var name = profile?.Name ?? username;
            var avatarUrl = profile?.AvatarKey is not null
                ? _storageService.GetPublicUrl(profile.AvatarKey.Value)
                : null;

            return new VerificationRequestItemDto(
                req.Id,
                req.UserId,
                username,
                name,
                avatarUrl,
                req.Category,
                req.Message,
                req.Status.ToString().ToLowerInvariant(),
                req.CreatedAtUtc);
        }).ToList();

        return Result.Success<IReadOnlyList<VerificationRequestItemDto>>(list);
    }
}
