using Showcase.Application.Features.Profiles.Common;

namespace Showcase.Application.Features.Profiles.Queries;



public record GetMyProfileQuery : IRequest<Result<MyProfileResponse>>;



public class GetMyProfileQueryHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService,
    IIdentityService identityService,
    IStorageService storageService) : IRequestHandler<GetMyProfileQuery, Result<MyProfileResponse>>
{
    private readonly IApplicationDbContext _context = context;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IIdentityService _identityService = identityService;
    private readonly IStorageService _storageService = storageService;

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

        return profile.ToMyProfileResponse(userResult.Value, _storageService);
    }
}

