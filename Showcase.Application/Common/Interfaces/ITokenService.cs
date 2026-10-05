namespace Showcase.Application.Common.Interfaces;

public record OnboardingTokenPayload(
    string Provider,
    string ProviderKey,
    string Email,
    string? Name,
    string? PictureUrl);

public interface ITokenService
{
    string GenerateAccessToken(string userId, string username, string? email, IList<string>? roles = null);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    string GenerateOnboardingToken(string provider, string providerKey, string email, string? name = null, string? pictureUrl = null);
    OnboardingTokenPayload? ValidateOnboardingToken(string token);
}
