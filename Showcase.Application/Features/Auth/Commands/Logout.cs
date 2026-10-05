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
        _authCookieService?.ClearAuthCookies();

        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthorized", "User is not authenticated.");
        }

        return await _identityService.RevokeRefreshTokenAsync(userId, ct);
    }
}

