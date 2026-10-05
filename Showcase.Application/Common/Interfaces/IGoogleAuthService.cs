namespace Showcase.Application.Common.Interfaces;

public record GoogleUserInfo(string Sub, string Email, string? Name, string? Picture);

public interface IGoogleAuthService
{
    Task<Result<GoogleUserInfo>> ExchangeCodeForUserInfoAsync(string code, CancellationToken ct);
}
