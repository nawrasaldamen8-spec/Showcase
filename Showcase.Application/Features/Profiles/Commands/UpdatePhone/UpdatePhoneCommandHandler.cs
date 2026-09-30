using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Profiles.Commands.UpdatePhone;

public class UpdatePhoneCommandHandler : IRequestHandler<UpdatePhoneCommand, Result>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;

    public UpdatePhoneCommandHandler(
        ICurrentUserService currentUserService,
        IIdentityService identityService)
    {
        _currentUserService = currentUserService;
        _identityService = identityService;
    }

    public async Task<Result> Handle(UpdatePhoneCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthorized", "User is not authenticated.");
        }

        return await _identityService.UpdatePhoneNumberAsync(userId, request.PhoneNumber, ct);
    }
}
