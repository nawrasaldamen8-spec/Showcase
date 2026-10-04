using FluentValidation;
using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Auth.Common;
using Showcase.Domain.Common.Results;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.Auth.Commands;



public record RefreshTokenCommand(
    string? AccessToken = null,
    string? RefreshToken = null) : IRequest<Result<AuthResponse>>
{
    public RefreshTokenCommand() : this(null, null) { }
}



public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthResponse>>
{
    private readonly IAuthSessionOrchestrator _authOrchestrator;

    public RefreshTokenCommandHandler(IAuthSessionOrchestrator authOrchestrator)
    {
        _authOrchestrator = authOrchestrator;
    }

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

