using Showcase.Application.Features.Auth.Common;

namespace Showcase.Application.Common.Interfaces;

public interface IAuthSessionOrchestrator
{
    Task<Result<AuthResponse>> CreateSessionAsync(
        UserIdentityDetails user,
        CancellationToken ct = default);

    Task<Result<AuthResponse>> RefreshSessionAsync(
        string? accessToken,
        string? refreshToken,
        CancellationToken ct = default);
}
