using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Profiles.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Profiles.Queries.GetProfiles;

public class GetProfilesQueryHandler : IRequestHandler<GetProfilesQuery, Result<IReadOnlyList<PublicProfileResponse>>>
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

    public async Task<Result<IReadOnlyList<PublicProfileResponse>>> Handle(GetProfilesQuery request, CancellationToken ct)
    {
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

        var profiles = await query
            .OrderByDescending(p => p.CreatedAt)
            .Take(50)
            .ToListAsync(ct);

        var list = new List<PublicProfileResponse>();

        foreach (var profile in profiles)
        {
            var userResult = await _identityService.GetUserByIdAsync(profile.UserId, ct);
            var username = userResult.IsSuccess ? userResult.Value.UserName : string.Empty;

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
                socialLinks));
        }

        return list;
    }
}
