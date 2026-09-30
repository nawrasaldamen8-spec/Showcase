using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Common.Models;
using Showcase.Application.Features.Profiles.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Profiles.Queries.GetProfiles;

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
        var pageNumber = request.PageNumber > 0 ? request.PageNumber : 1;
        var pageSize = request.PageSize is > 0 and <= 100 ? request.PageSize : 20;

        var query = _context.Profiles
            .Include(p => p.SocialLinks)
            .Where(p => !p.IsBanned && !p.IsDeleted)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(search) ||
                (p.Specialty != null && p.Specialty.ToLower().Contains(search)) ||
                (p.Country != null && p.Country.ToLower().Contains(search)));
        }

        var totalCount = await query.CountAsync(ct);

        var profiles = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        // Batch identity lookups
        var userIds = profiles.Select(p => p.UserId).Distinct().ToList();
        var usersResult = await _identityService.GetUsersByIdsAsync(userIds, ct);
        var usersDict = usersResult?.IsSuccess == true ? usersResult.Value : new Dictionary<string, UserIdentityDetails>();

        var list = new List<PublicProfileResponse>(profiles.Count);

        foreach (var profile in profiles)
        {
            if (!usersDict.TryGetValue(profile.UserId, out var userDetails))
            {
                var individualUser = await _identityService.GetUserByIdAsync(profile.UserId, ct);
                if (individualUser?.IsSuccess == true)
                {
                    userDetails = individualUser.Value;
                }
            }

            var username = userDetails?.UserName ?? string.Empty;

            var avatarUrl = profile.AvatarKey is not null
                ? _storageService.GetPublicUrl(profile.AvatarKey.Value)
                : null;

            var socialLinks = profile.SocialLinks
                .OrderBy(x => x.DisplayOrder)
                .Select(x => new SocialLinkDto(x.Id, x.Platform, x.Url.Value, x.DisplayOrder))
                .ToList();

            list.Add(new PublicProfileResponse(
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
                socialLinks));
        }

        var paginated = new PaginatedList<PublicProfileResponse>(list, totalCount, pageNumber, pageSize);
        return Result.Success(paginated);
    }
}
