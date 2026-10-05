using Showcase.Application.Features.Auth.Common;

namespace Showcase.Application.Features.Auth.Commands;



public record LoginCommand(
    string EmailOrUsername,
    string Password) : IRequest<Result<AuthResponse>>;



public class LoginCommandHandler(
    IIdentityService identityService,
    IAuthSessionOrchestrator authOrchestrator) : IRequestHandler<LoginCommand, Result<AuthResponse>>
{
    private readonly IIdentityService _identityService = identityService;
    private readonly IAuthSessionOrchestrator _authOrchestrator = authOrchestrator;

    public async Task<Result<AuthResponse>> Handle(LoginCommand request, CancellationToken ct)
    {
        var authResult = await _identityService.AuthenticateAsync(
            request.EmailOrUsername,
            request.Password,
            ct);

        if (authResult.IsFailure)
        {
            return Result.Failure<AuthResponse>(authResult.Error);
        }

        return await _authOrchestrator.CreateSessionAsync(authResult.Value, ct);
    }
}



public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.EmailOrUsername)
            .NotEmpty().WithMessage("Email or username is required.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.");
    }
}

