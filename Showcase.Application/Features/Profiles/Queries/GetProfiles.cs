using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Extensions;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Common.Models;
using Showcase.Application.Features.Profiles.Common;
using Showcase.Domain.Common.Results;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.Profiles.Queries;



public record GetProfilesQuery(
    string? Search = null,
    bool? FeaturedOnly = null,
    int PageNumber = 1,
    int PageSize = 20) : IRequest<Result<PaginatedList<PublicProfileResponse>>>, IPaginationRequest;



public class GetProfilesQueryHandler : IRequestHandler<GetProfilesQuery, Result<PaginatedList<PublicProfileResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly IStorageService _storageService;

    public GetProfilesQueryHandler(
        IApplicationDbContext context,
        IIdentityService identityService,
        IStorageService storageService)
    {
        _context = context;
        _identityService = identityService;
        _storageService = storageService;
    }

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

