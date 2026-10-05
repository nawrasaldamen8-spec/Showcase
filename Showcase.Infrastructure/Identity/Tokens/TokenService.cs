using Microsoft.IdentityModel.Tokens;

namespace Showcase.Infrastructure.Identity;

public class TokenService : ITokenService
{
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<TokenService>? _logger;

    public TokenService(IOptions<JwtSettings> jwtOptions, ILogger<TokenService>? logger = null)
    {
        ArgumentNullException.ThrowIfNull(jwtOptions);
        _jwtSettings = jwtOptions.Value ?? new JwtSettings();
        _logger = logger;
    }

    public string GenerateAccessToken(string userId, string username, string? email, IList<string>? roles = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId);
        ArgumentException.ThrowIfNullOrWhiteSpace(username);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId),
            new(ClaimTypes.NameIdentifier, userId),
            new(JwtRegisteredClaimNames.UniqueName, username),
            new("preferred_username", username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        // Email is optional on this platform, so the claim is emitted only when the account actually has one.
        if (!string.IsNullOrWhiteSpace(email))
        {
            claims.Add(new Claim(JwtRegisteredClaimNames.Email, email.Trim()));
            claims.Add(new Claim(ClaimTypes.Email, email.Trim()));
        }

        if (roles is not null)
        {
            var distinctRoles = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var role in roles)
            {
                if (!string.IsNullOrWhiteSpace(role) && distinctRoles.Add(role.Trim()))
                {
                    claims.Add(new Claim(ClaimTypes.Role, role.Trim()));
                    claims.Add(new Claim("role", role.Trim()));
                }
            }
        }

        var isConfiguredSecret = !string.IsNullOrWhiteSpace(_jwtSettings.Secret) && Encoding.UTF8.GetByteCount(_jwtSettings.Secret.Trim()) >= 32;
        if (!isConfiguredSecret)
        {
            _logger?.LogWarning("JWT Secret is not properly configured or is too short (< 32 bytes). Using development fallback secret. DO NOT use in production!");
        }

        var secret = isConfiguredSecret
            ? _jwtSettings.Secret.Trim()
            : JwtSettings.DefaultDevelopmentSecret;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiryMinutes = _jwtSettings.ExpiryMinutes > 0 ? _jwtSettings.ExpiryMinutes : 60;
        var now = DateTime.UtcNow;
        var expires = now.AddMinutes(expiryMinutes);

        var token = new JwtSecurityToken(
            issuer: string.IsNullOrWhiteSpace(_jwtSettings.Issuer) ? null : _jwtSettings.Issuer.Trim(),
            audience: string.IsNullOrWhiteSpace(_jwtSettings.Audience) ? null : _jwtSettings.Audience.Trim(),
            claims: claims,
            notBefore: now.AddSeconds(-5),
            expires: expires,
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomBytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(randomBytes);
    }

    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return null;

        var secret = !string.IsNullOrWhiteSpace(_jwtSettings.Secret) && Encoding.UTF8.GetByteCount(_jwtSettings.Secret.Trim()) >= 32
            ? _jwtSettings.Secret.Trim()
            : JwtSettings.DefaultDevelopmentSecret;

        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
            ValidateIssuer = !string.IsNullOrWhiteSpace(_jwtSettings.Issuer),
            ValidIssuer = string.IsNullOrWhiteSpace(_jwtSettings.Issuer) ? null : _jwtSettings.Issuer,
            ValidateAudience = !string.IsNullOrWhiteSpace(_jwtSettings.Audience),
            ValidAudience = string.IsNullOrWhiteSpace(_jwtSettings.Audience) ? null : _jwtSettings.Audience,
            ValidateLifetime = false,
            ClockSkew = TimeSpan.Zero,
            ValidAlgorithms = new[] { SecurityAlgorithms.HmacSha256 }
        };

        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);

            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            return principal;
        }
        catch
        {
            return null;
        }
    }

    public string GenerateOnboardingToken(string provider, string providerKey, string email, string? name = null, string? pictureUrl = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(provider);
        ArgumentException.ThrowIfNullOrWhiteSpace(providerKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);

        var claims = new List<Claim>
        {
            new("purpose", "oauth_onboarding"),
            new("provider", provider),
            new("provider_key", providerKey),
            new(JwtRegisteredClaimNames.Email, email.Trim()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        if (!string.IsNullOrWhiteSpace(name))
        {
            claims.Add(new Claim("name", name.Trim()));
        }

        if (!string.IsNullOrWhiteSpace(pictureUrl))
        {
            claims.Add(new Claim("picture", pictureUrl.Trim()));
        }

        var secret = !string.IsNullOrWhiteSpace(_jwtSettings.Secret) && Encoding.UTF8.GetByteCount(_jwtSettings.Secret.Trim()) >= 32
            ? _jwtSettings.Secret.Trim()
            : JwtSettings.DefaultDevelopmentSecret;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var now = DateTime.UtcNow;

        var token = new JwtSecurityToken(
            issuer: string.IsNullOrWhiteSpace(_jwtSettings.Issuer) ? null : _jwtSettings.Issuer,
            audience: string.IsNullOrWhiteSpace(_jwtSettings.Audience) ? null : _jwtSettings.Audience,
            claims: claims,
            notBefore: now.AddSeconds(-5),
            expires: now.AddMinutes(30),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public OnboardingTokenPayload? ValidateOnboardingToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return null;

        var secret = !string.IsNullOrWhiteSpace(_jwtSettings.Secret) && Encoding.UTF8.GetByteCount(_jwtSettings.Secret.Trim()) >= 32
            ? _jwtSettings.Secret.Trim()
            : JwtSettings.DefaultDevelopmentSecret;

        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
            ValidateIssuer = !string.IsNullOrWhiteSpace(_jwtSettings.Issuer),
            ValidIssuer = string.IsNullOrWhiteSpace(_jwtSettings.Issuer) ? null : _jwtSettings.Issuer,
            ValidateAudience = !string.IsNullOrWhiteSpace(_jwtSettings.Audience),
            ValidAudience = string.IsNullOrWhiteSpace(_jwtSettings.Audience) ? null : _jwtSettings.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
            ValidAlgorithms = new[] { SecurityAlgorithms.HmacSha256 }
        };

        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);

            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            var purpose = principal.FindFirst("purpose")?.Value;
            if (!string.Equals(purpose, "oauth_onboarding", StringComparison.Ordinal))
            {
                return null;
            }

            var provider = principal.FindFirst("provider")?.Value;
            var providerKey = principal.FindFirst("provider_key")?.Value;
            var email = principal.FindFirst(JwtRegisteredClaimNames.Email)?.Value ?? principal.FindFirst(ClaimTypes.Email)?.Value;
            var name = principal.FindFirst("name")?.Value;
            var picture = principal.FindFirst("picture")?.Value;

            if (string.IsNullOrWhiteSpace(provider) || string.IsNullOrWhiteSpace(providerKey) || string.IsNullOrWhiteSpace(email))
            {
                return null;
            }

            return new OnboardingTokenPayload(provider, providerKey, email, name, picture);
        }
        catch
        {
            return null;
        }
    }
}
