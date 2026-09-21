using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Auth.Queries.GetCurrentUser;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, Result<CurrentUserResponse>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;
    private readonly IApplicationDbContext _context;
    private readonly IStorageService _storageService;

    public GetCurrentUserQueryHandler(
        ICurrentUserService currentUserService,
        IIdentityService identityService,
        IApplicationDbContext context,
        IStorageService storageService)
    {
        _currentUserService = currentUserService;
        _identityService = identityService;
        _context = context;
        _storageService = storageService;
    }

    public async Task<Result<CurrentUserResponse>> Handle(GetCurrentUserQuery request, CancellationToken ct)
    {
        var currentUserId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(currentUserId))
        {
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");
        }

        var userResult = await _identityService.GetUserByIdAsync(currentUserId, ct);
        if (userResult.IsFailure)
        {
            return Result.Failure<CurrentUserResponse>(userResult.Error);
        }

        var user = userResult.Value;

        var profile = await _context.Set<Profile>()
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == currentUserId, ct);

        if (profile is null)
        {
            return Error.NotFound("Profile.NotFound", "User profile was not found.");
        }

        string? avatarUrl = profile.AvatarKey is not null
            ? _storageService.GetPublicUrl(profile.AvatarKey.Value)
            : null;

        return new CurrentUserResponse(
            user.Id,
            user.Email,
            user.UserName,
            profile.FirstName,
            profile.LastName,
            profile.Id,
            profile.Bio?.Value,
            avatarUrl,
            user.Roles);
    }
}
