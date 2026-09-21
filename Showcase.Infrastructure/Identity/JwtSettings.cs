namespace Showcase.Infrastructure.Identity;

public record JwtSettings
{
    public const string SectionName = "JwtSettings";
    public const string DefaultDevelopmentSecret = "ShowcasePlatformSuperSecretKeyForJwtSigningMustBeAtLeast256BitsLong!";

    public string Secret { get; init; } = DefaultDevelopmentSecret;
    public string Issuer { get; init; } = "ShowcaseApi";
    public string Audience { get; init; } = "ShowcaseClient";
    public int ExpiryMinutes { get; init; } = 60;
}
