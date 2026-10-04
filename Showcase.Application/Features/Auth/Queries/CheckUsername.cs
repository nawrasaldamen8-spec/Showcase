using FluentValidation;
using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.Auth.Queries;



public record CheckUsernameQuery(string Username) : IRequest<Result<CheckUsernameResponse>>;



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



public class CheckUsernameQueryValidator : AbstractValidator<CheckUsernameQuery>
{
    public CheckUsernameQueryValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required.")
            .MinimumLength(3).WithMessage("Username must be at least 3 characters.")
            .MaximumLength(50).WithMessage("Username must not exceed 50 characters.")
            .Matches(@"^[a-zA-Z0-9_]+$").WithMessage("Username can only contain alphanumeric characters and underscores.");
    }
}


public record CheckUsernameResponse(bool Available);

