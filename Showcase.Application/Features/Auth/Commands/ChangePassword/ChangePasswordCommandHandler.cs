using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Auth.Commands.ChangePassword;

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Result>
{
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUserService;

    public ChangePasswordCommandHandler(
        IIdentityService identityService,
        ICurrentUserService currentUserService)
    {
        _identityService = identityService;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(ChangePasswordCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthorized", "User is not authenticated.");
        }

        return await _identityService.ChangePasswordAsync(
            userId,
            request.CurrentPassword,
            request.NewPassword,
            ct);
    }
}
