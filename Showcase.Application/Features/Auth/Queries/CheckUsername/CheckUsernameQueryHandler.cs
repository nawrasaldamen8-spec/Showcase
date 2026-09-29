using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Auth.Queries.CheckUsername;

public class CheckUsernameQueryHandler : IRequestHandler<CheckUsernameQuery, Result<CheckUsernameResponse>>
{
    private readonly IIdentityService _identityService;

    public CheckUsernameQueryHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<Result<CheckUsernameResponse>> Handle(CheckUsernameQuery request, CancellationToken ct)
    {
        var result = await _identityService.GetUserByUsernameAsync(request.Username, ct);
        // If user is not found, username is available
        bool isAvailable = result.IsFailure;
        return new CheckUsernameResponse(isAvailable);
    }
}
