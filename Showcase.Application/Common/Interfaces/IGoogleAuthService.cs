using System.Threading;
using System.Threading.Tasks;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Common.Interfaces;

public record GoogleUserInfo(string Sub, string Email, string? Name, string? Picture);

public interface IGoogleAuthService
{
    Task<Result<GoogleUserInfo>> ExchangeCodeForUserInfoAsync(string code, CancellationToken ct);
}
