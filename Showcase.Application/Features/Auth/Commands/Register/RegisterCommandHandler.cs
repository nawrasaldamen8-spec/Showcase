using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Auth.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<AuthResponse>>
{
    private readonly IIdentityService _identityService;
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;

    public RegisterCommandHandler(
        IIdentityService identityService,
        IApplicationDbContext context,
        ITokenService tokenService)
    {
        _identityService = identityService;
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<Result<AuthResponse>> Handle(RegisterCommand request, CancellationToken ct)
    {
        // 1. Register User in Identity
        var registerResult = await _identityService.RegisterUserAsync(
            request.Email,
            request.Username,
            request.Password,
            ct);

        if (registerResult.IsFailure)
        {
            return Result.Failure<AuthResponse>(registerResult.Error);
        }

        var userId = registerResult.Value;

        // 2. Provision linked Profile entity in Domain
        var profile = new Profile(userId, request.FirstName, request.LastName);
        _context.Set<Profile>().Add(profile);
        await _context.SaveChangesAsync(ct);

        // 3. Generate tokens
        var roles = new List<string>();
        var accessToken = _tokenService.GenerateAccessToken(userId, request.Email.Trim(), roles);
        var refreshToken = _tokenService.GenerateRefreshToken();

        // 4. Persist refresh token with 7-day expiration
        var updateTokenResult = await _identityService.UpdateRefreshTokenAsync(
            userId,
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
