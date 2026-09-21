using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Auth.Commands.Logout;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand, Result>
{
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUserService;

    public LogoutCommandHandler(
        IIdentityService identityService,
        ICurrentUserService currentUserService)
    {
        _identityService = identityService;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(LogoutCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthorized", "User is not authenticated.");
        }

        return await _identityService.RevokeRefreshTokenAsync(userId, ct);
    }
}
