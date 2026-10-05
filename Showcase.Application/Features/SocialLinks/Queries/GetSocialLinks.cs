using Showcase.Application.Features.Profiles.Common;

namespace Showcase.Application.Features.SocialLinks.Queries;



public record GetSocialLinksQuery : IRequest<Result<IReadOnlyList<SocialLinkDto>>>;



public class GetSocialLinksQueryHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context) : IRequestHandler<GetSocialLinksQuery, Result<IReadOnlyList<SocialLinkDto>>>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result<IReadOnlyList<SocialLinkDto>>> Handle(GetSocialLinksQuery request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        var profile = await _context.Profiles
            .Include(p => p.SocialLinks)
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);

        if (profile is null)
            return ProfileErrors.NotFoundForUser(userId);

        var list = profile.SocialLinks
            .OrderBy(x => x.DisplayOrder)
            .Select(x => new SocialLinkDto(x.Id, x.Platform, x.Url.Value, x.DisplayOrder))
            .ToList();

        return list;
    }
}

