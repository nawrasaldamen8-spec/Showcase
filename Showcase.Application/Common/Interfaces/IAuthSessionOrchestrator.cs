using System.Threading;
using System.Threading.Tasks;
using Showcase.Application.Features.Auth.Common;
using Showcase.Domain.Common.Results;

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
