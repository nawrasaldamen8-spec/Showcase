using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Profiles.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Profiles.Queries.GetPublicProfile;

public class GetPublicProfileQueryHandler : IRequestHandler<GetPublicProfileQuery, Result<PublicProfileResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly IStorageService _storageService;

    public GetPublicProfileQueryHandler(
        IApplicationDbContext context,
        IIdentityService identityService,
        IStorageService storageService)
    {
        _context = context;
        _identityService = identityService;
        _storageService = storageService;
    }

    public async Task<Result<PublicProfileResponse>> Handle(GetPublicProfileQuery request, CancellationToken ct)
    {
        var userResult = await _identityService.GetUserByUsernameAsync(request.Username, ct);
        if (userResult.IsFailure)
        {
            return Result.Failure<PublicProfileResponse>(userResult.Error);
        }

        var user = userResult.Value;
        var profile = await _context.Profiles
            .Include(p => p.SocialLinks)
            .FirstOrDefaultAsync(p => p.UserId == user.Id, ct);

        if (profile is null)
        {
            return ProfileErrors.NotFoundForUser(user.Id);
        }

        var avatarUrl = profile.AvatarKey is not null
            ? _storageService.GetPublicUrl(profile.AvatarKey.Value)
            : null;

        var socialLinks = profile.SocialLinks
            .OrderBy(x => x.DisplayOrder)
            .Select(x => new SocialLinkDto(x.Id, x.Platform, x.Url.Value, x.DisplayOrder))
            .ToList();

        var response = new PublicProfileResponse(
            profile.Id,
            user.UserName,
            profile.FirstName,
            profile.LastName,
            profile.Bio?.Value,
            avatarUrl,
            socialLinks);

        return response;
    }
}
