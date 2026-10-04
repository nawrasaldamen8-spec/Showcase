using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.Auth.Commands;



public record LogoutCommand : IRequest<Result>;



public class LogoutCommandHandler : IRequestHandler<LogoutCommand, Result>
{
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAuthCookieService? _authCookieService;

    public LogoutCommandHandler(
        IIdentityService identityService,
        ICurrentUserService currentUserService,
        IAuthCookieService? authCookieService = null)
    {
        _identityService = identityService;
        _currentUserService = currentUserService;
        _authCookieService = authCookieService;
    }

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

