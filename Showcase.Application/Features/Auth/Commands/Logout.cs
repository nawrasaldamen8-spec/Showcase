namespace Showcase.Application.Features.Auth.Commands;



public record LogoutCommand : IRequest<Result>;



public class LogoutCommandHandler(
    IIdentityService identityService,
    ICurrentUserService currentUserService,
    IAuthCookieService? authCookieService = null) : IRequestHandler<LogoutCommand, Result>
{
    private readonly IIdentityService _identityService = identityService;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IAuthCookieService? _authCookieService = authCookieService;

    public async Task<Result> Handle(LogoutCommand request, CancellationToken ct)
    {
        var refreshToken = _authCookieService?.GetRefreshToken();
        _authCookieService?.ClearAuthCookies();

        var userId = _currentUserService.UserId;

        if (string.IsNullOrWhiteSpace(userId) && !string.IsNullOrWhiteSpace(refreshToken))
        {
            var userResult = await _identityService.ValidateRefreshTokenDirectAsync(refreshToken, ct);
            if (userResult.IsSuccess)
            {
                userId = userResult.Value.Id;
            }
        }

        if (!string.IsNullOrWhiteSpace(userId))
        {
            await _identityService.RevokeRefreshTokenAsync(userId, ct);
        }

        return Result.Success();
    }
}

