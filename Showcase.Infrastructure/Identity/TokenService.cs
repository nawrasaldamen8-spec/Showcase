using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Showcase.Application.Common.Interfaces;

namespace Showcase.Infrastructure.Identity;

public class TokenService : ITokenService
{
    private readonly JwtSettings _jwtSettings;

    public TokenService(IOptions<JwtSettings> jwtOptions)
    {
        ArgumentNullException.ThrowIfNull(jwtOptions);
        _jwtSettings = jwtOptions.Value ?? new JwtSettings();
    }

    public string GenerateAccessToken(string userId, string email, IList<string>? roles = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId),
            new(ClaimTypes.NameIdentifier, userId),
            new(JwtRegisteredClaimNames.Email, email),
            new(ClaimTypes.Email, email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

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

        var secret = !string.IsNullOrWhiteSpace(_jwtSettings.Secret) && Encoding.UTF8.GetByteCount(_jwtSettings.Secret.Trim()) >= 32
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
}
