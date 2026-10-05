using Showcase.Application.Features.Auth.Common;

namespace Showcase.Infrastructure.Identity;

public class AuthSessionOrchestrator(
    IIdentityService identityService,
    ITokenService tokenService,
    IAuthCookieService? authCookieService = null) : IAuthSessionOrchestrator
{
    private readonly IIdentityService _identityService = identityService;
    private readonly ITokenService _tokenService = tokenService;
    private readonly IAuthCookieService? _authCookieService = authCookieService;

    public async Task<Result<AuthResponse>> CreateSessionAsync(
        UserIdentityDetails user,
        CancellationToken ct = default)
    {
        var accessToken = _tokenService.GenerateAccessToken(user.Id, user.UserName, user.Email, user.Roles);
        var refreshToken = _tokenService.GenerateRefreshToken();

        var updateResult = await _identityService.UpdateRefreshTokenAsync(
            user.Id,
            refreshToken,
            DateTime.UtcNow.AddDays(7),
            ct);

        if (updateResult.IsFailure)
        {
            return Result.Failure<AuthResponse>(updateResult.Error);
        }

        _authCookieService?.SetAuthCookies(accessToken, refreshToken);

        return new AuthResponse(accessToken, refreshToken);
    }

    public async Task<Result<AuthResponse>> RefreshSessionAsync(
        string? accessToken,
        string? refreshToken,
        CancellationToken ct = default)
    {
        var resolvedAccessToken = !string.IsNullOrWhiteSpace(accessToken)
            ? accessToken
            : _authCookieService?.GetAccessToken();

        var resolvedRefreshToken = !string.IsNullOrWhiteSpace(refreshToken)
            ? refreshToken
            : _authCookieService?.GetRefreshToken();

        if (string.IsNullOrWhiteSpace(resolvedRefreshToken))
        {
            return Error.Unauthorized("Auth.InvalidRefreshToken", "Refresh token is missing.");
        }

        var userResult = await ResolveUserFromTokensAsync(resolvedAccessToken, resolvedRefreshToken, ct);
        if (userResult.IsFailure)
        {
            return Result.Failure<AuthResponse>(userResult.Error);
        }

        return await CreateSessionAsync(userResult.Value, ct);
    }

    private async Task<Result<UserIdentityDetails>> ResolveUserFromTokensAsync(
        string? accessToken,
        string refreshToken,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return await _identityService.ValidateRefreshTokenDirectAsync(refreshToken, ct);
        }

        var principal = _tokenService.GetPrincipalFromExpiredToken(accessToken);
        if (principal is null)
        {
            return Error.Unauthorized("Auth.InvalidToken", "Invalid or malformed access token.");
        }

        var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.InvalidToken", "Access token is missing user identifier claim.");
        }

        return await _identityService.ValidateRefreshTokenAsync(userId, refreshToken, ct);
    }
}
