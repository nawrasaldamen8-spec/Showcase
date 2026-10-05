using Showcase.Application.Features.Auth.Common;

namespace Showcase.Application.Features.Auth.Commands;



public record RefreshTokenCommand(
    string? AccessToken = null,
    string? RefreshToken = null) : IRequest<Result<AuthResponse>>
{
    public RefreshTokenCommand() : this(null, null) { }
}



public class RefreshTokenCommandHandler(IAuthSessionOrchestrator authOrchestrator) : IRequestHandler<RefreshTokenCommand, Result<AuthResponse>>
{
    private readonly IAuthSessionOrchestrator _authOrchestrator = authOrchestrator;

    public async Task<Result<AuthResponse>> Handle(RefreshTokenCommand request, CancellationToken ct)
    {
        return await _authOrchestrator.RefreshSessionAsync(request.AccessToken, request.RefreshToken, ct);
    }
}



public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenCommandValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage("Refresh token is required.");
    }
}

