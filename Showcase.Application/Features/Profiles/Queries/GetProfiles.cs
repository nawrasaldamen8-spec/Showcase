using Showcase.Application.Features.Profiles.Common;

namespace Showcase.Application.Features.Profiles.Queries;



public record GetProfilesQuery(
    string? Search = null,
    bool? FeaturedOnly = null,
    int PageNumber = 1,
    int PageSize = 20) : IRequest<Result<PaginatedList<PublicProfileResponse>>>, IPaginationRequest;



public class GetProfilesQueryHandler(
    IApplicationDbContext context,
    IIdentityService identityService,
    IStorageService storageService) : IRequestHandler<GetProfilesQuery, Result<PaginatedList<PublicProfileResponse>>>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IIdentityService _identityService = identityService;
    private readonly IStorageService _storageService = storageService;

    public async Task<Result<PaginatedList<PublicProfileResponse>>> Handle(GetProfilesQuery request, CancellationToken ct)
    {
        var pagedProfiles = await _context.Profiles
            .Include(p => p.SocialLinks)
            .WhereActive()
            .WhereFeatured(request.FeaturedOnly)
            .Search(request.Search)
            .OrderByDescending(p => p.CreatedAt)
            .ThenByDescending(p => p.Id)
            .ToPaginatedListAsync(request, ct);

        if (pagedProfiles.TotalCount == 0)
        {
            return PaginatedList<PublicProfileResponse>.Empty(request.PageNumber, request.PageSize);
        }

        var userIds = pagedProfiles.Items.Select(p => p.UserId).Distinct().ToList();
        var usersDict = await _identityService.GetUserIdentitiesAsync(userIds, ct);

        return pagedProfiles.Map(profile =>
        {
            var username = usersDict.TryGetValue(profile.UserId, out var userDetails)
                ? userDetails.UserName
                : string.Empty;

            return profile.ToPublicResponse(username, _storageService);
        });
    }
}

