using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Auth.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Auth.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<AuthResponse>>
{
    private readonly IIdentityService _identityService;
    private readonly ITokenService _tokenService;

    public LoginCommandHandler(
        IIdentityService identityService,
        ITokenService tokenService)
    {
        _identityService = identityService;
        _tokenService = tokenService;
    }

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

        var user = authResult.Value;

        var accessToken = _tokenService.GenerateAccessToken(user.Id, user.Email, user.Roles);
        var refreshToken = _tokenService.GenerateRefreshToken();

        var updateTokenResult = await _identityService.UpdateRefreshTokenAsync(
            user.Id,
            refreshToken,
            DateTime.UtcNow.AddDays(7),
            ct);

        if (updateTokenResult.IsFailure)
        {
            return Result.Failure<AuthResponse>(updateTokenResult.Error);
        }

        return new AuthResponse(accessToken, refreshToken);
    }
}
