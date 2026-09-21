using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Profiles.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Profiles.Queries.GetMyProfile;

public class GetMyProfileQueryHandler : IRequestHandler<GetMyProfileQuery, Result<MyProfileResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;
    private readonly IStorageService _storageService;

    public GetMyProfileQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IIdentityService identityService,
        IStorageService storageService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _identityService = identityService;
        _storageService = storageService;
    }

    public async Task<Result<MyProfileResponse>> Handle(GetMyProfileQuery request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthorized", "User is not authenticated.");
        }

        var profile = await _context.Profiles
            .Include(p => p.SocialLinks)
            .FirstOrDefaultAsync(p => p.UserId == userId, ct);

        if (profile is null)
        {
            return ProfileErrors.NotFoundForUser(userId);
        }

        var userResult = await _identityService.GetUserByIdAsync(userId, ct);
        if (userResult.IsFailure)
        {
            return Result.Failure<MyProfileResponse>(userResult.Error);
        }

        var user = userResult.Value;
        var avatarUrl = profile.AvatarKey is not null
            ? _storageService.GetPublicUrl(profile.AvatarKey.Value)
            : null;

        var socialLinks = profile.SocialLinks
            .OrderBy(x => x.DisplayOrder)
            .Select(x => new SocialLinkDto(x.Id, x.Platform, x.Url.Value, x.DisplayOrder))
            .ToList();

        var response = new MyProfileResponse(
            profile.Id,
            profile.UserId,
            user.Email,
            user.UserName,
            profile.FirstName,
            profile.LastName,
            profile.Bio?.Value,
            profile.AvatarKey?.Value,
            avatarUrl,
            socialLinks,
            profile.CreatedAt,
            profile.UpdatedAt);

        return response;
    }
}
