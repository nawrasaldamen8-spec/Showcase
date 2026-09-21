using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Auth.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Auth.Commands.RefreshToken;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthResponse>>
{
    private readonly IIdentityService _identityService;
    private readonly ITokenService _tokenService;

    public RefreshTokenCommandHandler(
        IIdentityService identityService,
        ITokenService tokenService)
    {
        _identityService = identityService;
        _tokenService = tokenService;
    }

    public async Task<Result<AuthResponse>> Handle(RefreshTokenCommand request, CancellationToken ct)
    {
        var principal = _tokenService.GetPrincipalFromExpiredToken(request.AccessToken);
        if (principal is null)
        {
            return Error.Unauthorized("Auth.InvalidToken", "Invalid or malformed access token.");
        }

        var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.InvalidToken", "Access token is missing user identifier claim.");
        }

        var validateResult = await _identityService.ValidateRefreshTokenAsync(
            userId,
            request.RefreshToken,
            ct);

        if (validateResult.IsFailure)
        {
            return Result.Failure<AuthResponse>(validateResult.Error);
        }

        var user = validateResult.Value;

        var newAccessToken = _tokenService.GenerateAccessToken(user.Id, user.Email, user.Roles);
        var newRefreshToken = _tokenService.GenerateRefreshToken();

        var updateTokenResult = await _identityService.UpdateRefreshTokenAsync(
            user.Id,
            newRefreshToken,
            DateTime.UtcNow.AddDays(7),
            ct);

        if (updateTokenResult.IsFailure)
        {
            return Result.Failure<AuthResponse>(updateTokenResult.Error);
        }

        return new AuthResponse(newAccessToken, newRefreshToken);
    }
}
