using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Showcase.Infrastructure.Identity;
using Xunit;

namespace Showcase.Infrastructure.Tests;

public class TokenServiceTests
{
    private readonly JwtSettings _jwtSettings;
    private readonly IOptions<JwtSettings> _jwtOptions;
    private readonly TokenService _tokenService;

    public TokenServiceTests()
    {
        _jwtSettings = new JwtSettings
        {
            Secret = "SuperSecretTestingKeyForJwtValidation1234567890!#$",
            Issuer = "TestIssuer",
            Audience = "TestAudience",
            ExpiryMinutes = 30
        };

        _jwtOptions = Options.Create(_jwtSettings);
        _tokenService = new TokenService(_jwtOptions);
    }

    [Fact]
    public void GenerateAccessToken_ShouldReturnValidJwt_WithExpectedClaims()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var email = "testuser@example.com";
        var roles = new List<string> { "Admin", "User" };

        // Act
        var tokenString = _tokenService.GenerateAccessToken(userId, email, roles);

        // Assert
        Assert.NotNull(tokenString);
        Assert.NotEmpty(tokenString);

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(tokenString);

        Assert.Equal(_jwtSettings.Issuer, jwtToken.Issuer);
        Assert.Contains(_jwtSettings.Audience, jwtToken.Audiences);

        var subClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);
        Assert.NotNull(subClaim);
        Assert.Equal(userId, subClaim.Value);

        var emailClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Email);
        Assert.NotNull(emailClaim);
        Assert.Equal(email, emailClaim.Value);

        var roleClaims = jwtToken.Claims.Where(c => c.Type == ClaimTypes.Role || c.Type == "role").Select(c => c.Value).Distinct().ToList();
        Assert.Contains("Admin", roleClaims);
        Assert.Contains("User", roleClaims);

        Assert.True(jwtToken.ValidTo > DateTime.UtcNow);
    }

    [Fact]
    public void GenerateAccessToken_WithoutRoles_ShouldSucceed()
    {
        // Arrange
        var userId = "user-123";
        var email = "noroles@example.com";

        // Act
        var tokenString = _tokenService.GenerateAccessToken(userId, email);

        // Assert
        Assert.NotEmpty(tokenString);
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(tokenString);
        Assert.Equal(userId, jwtToken.Claims.First(c => c.Type == JwtRegisteredClaimNames.Sub).Value);
    }

    [Theory]
    [InlineData("", "test@example.com")]
    [InlineData("   ", "test@example.com")]
    [InlineData("user-1", "")]
    [InlineData("user-1", "   ")]
    public void GenerateAccessToken_WithInvalidArguments_ShouldThrowArgumentException(string userId, string email)
    {
        Assert.Throws<ArgumentException>(() => _tokenService.GenerateAccessToken(userId, email));
    }

    [Fact]
    public void GenerateRefreshToken_ShouldReturnCryptographicallySecureBase64String()
    {
        // Act
        var token1 = _tokenService.GenerateRefreshToken();
        var token2 = _tokenService.GenerateRefreshToken();

        // Assert
        Assert.NotEmpty(token1);
        Assert.NotEmpty(token2);
        Assert.NotEqual(token1, token2);

        var bytes = Convert.FromBase64String(token1);
        Assert.Equal(64, bytes.Length);
    }

    [Fact]
    public void GetPrincipalFromExpiredToken_WithExpiredToken_ShouldReturnPrincipalWithoutLifetimeValidation()
    {
        // Arrange: create an expired token manually using same secret and HMAC-SHA256
        var userId = "expired-user-id";
        var email = "expired@example.com";
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(ClaimTypes.Role, "Creator")
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiredToken = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow.AddMinutes(-60),
            expires: DateTime.UtcNow.AddMinutes(-30), // Expired 30 minutes ago
            signingCredentials: creds);

        var expiredTokenString = new JwtSecurityTokenHandler().WriteToken(expiredToken);

        // Act
        var principal = _tokenService.GetPrincipalFromExpiredToken(expiredTokenString);

        // Assert
        Assert.NotNull(principal);
        var idClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        Assert.Equal(userId, idClaim);
    }

    [Fact]
    public void GetPrincipalFromExpiredToken_WithTamperedToken_ShouldReturnNull()
    {
        // Arrange
        var validToken = _tokenService.GenerateAccessToken("user1", "user1@example.com");
        var tamperedToken = validToken.Substring(0, validToken.Length - 5) + "abcde";

        // Act
        var principal = _tokenService.GetPrincipalFromExpiredToken(tamperedToken);

        // Assert
        Assert.Null(principal);
    }

    [Fact]
    public void GetPrincipalFromExpiredToken_WithDifferentSecret_ShouldReturnNull()
    {
        // Arrange: token signed with another secret
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("AnotherSecretKeyThatIsCompletelyDifferentAndLong123!"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: new[] { new Claim("sub", "user1") },
            expires: DateTime.UtcNow.AddMinutes(10),
            signingCredentials: creds);
        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        // Act
        var principal = _tokenService.GetPrincipalFromExpiredToken(tokenString);

        // Assert
        Assert.Null(principal);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("not-a-token")]
    public void GetPrincipalFromExpiredToken_WithInvalidInput_ShouldReturnNull(string invalidToken)
    {
        var principal = _tokenService.GetPrincipalFromExpiredToken(invalidToken);
        Assert.Null(principal);
    }

    [Fact]
    public void GenerateAccessToken_WithEmptySecretInSettings_ShouldUseDefaultDevelopmentSecretAndSucceed()
    {
        var emptySecretSettings = new JwtSettings { Secret = "" };
        var service = new TokenService(Options.Create(emptySecretSettings));

        var tokenString = service.GenerateAccessToken("user-fallback", "fallback@example.com");

        Assert.NotEmpty(tokenString);
        var principal = service.GetPrincipalFromExpiredToken(tokenString);
        Assert.NotNull(principal);
    }

    [Fact]
    public void GetPrincipalFromExpiredToken_WhenIssuerAndAudienceEmpty_ShouldStillValidateSignature()
    {
        var minimalSettings = new JwtSettings
        {
            Secret = "SuperSecretTestingKeyForJwtValidation1234567890!#$",
            Issuer = "",
            Audience = ""
        };
        var service = new TokenService(Options.Create(minimalSettings));
        var tokenString = service.GenerateAccessToken("user-minimal", "minimal@example.com");

        var principal = service.GetPrincipalFromExpiredToken(tokenString);

        Assert.NotNull(principal);
        var subClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        Assert.Equal("user-minimal", subClaim);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    public void GenerateAccessToken_WithNonPositiveExpiryMinutes_ShouldDefaultToValidLifetime(int nonPositiveExpiry)
    {
        var settings = _jwtSettings with { ExpiryMinutes = nonPositiveExpiry };
        var service = new TokenService(Options.Create(settings));

        var tokenString = service.GenerateAccessToken("user-expiry", "expiry@example.com");

        Assert.NotEmpty(tokenString);
        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(tokenString);
        Assert.True(jwt.ValidTo > DateTime.UtcNow);
    }

    [Fact]
    public void Constructor_WhenJwtOptionsIsNull_ShouldThrowArgumentNullException()
    {
        Assert.Throws<ArgumentNullException>(() => new TokenService(null!));
    }

    [Fact]
    public void GenerateAccessToken_WithNullOrWhitespaceRoles_ShouldFilterThemOut()
    {
        var roles = new List<string> { "Admin", "", "   ", "Editor" };
        var tokenString = _tokenService.GenerateAccessToken("user-roles", "roles@example.com", roles);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(tokenString);
        var roleClaims = jwt.Claims.Where(c => c.Type == ClaimTypes.Role || c.Type == "role").Select(c => c.Value).Distinct().ToList();

        Assert.Equal(2, roleClaims.Count);
        Assert.Contains("Admin", roleClaims);
        Assert.Contains("Editor", roleClaims);
    }

    [Fact]
    public void GenerateAccessToken_WithDuplicateRoles_ShouldDeduplicateRoles()
    {
        var roles = new List<string> { "Admin", "admin", "Admin", "User", "user" };
        var tokenString = _tokenService.GenerateAccessToken("user-roles", "roles@example.com", roles);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(tokenString);
        var roleClaims = jwt.Claims.Where(c => c.Type == ClaimTypes.Role || c.Type == "role").Select(c => c.Value).Distinct().ToList();

        Assert.Equal(2, roleClaims.Count);
        Assert.Contains("Admin", roleClaims);
        Assert.Contains("User", roleClaims);
    }

    [Fact]
    public void GenerateAccessToken_WithSecretShorterThan256Bits_ShouldFallbackToDefaultSecretAndSucceed()
    {
        var shortSecretSettings = new JwtSettings { Secret = "TooShort" };
        var service = new TokenService(Options.Create(shortSecretSettings));

        var tokenString = service.GenerateAccessToken("user-short-secret", "short@example.com");

        Assert.NotEmpty(tokenString);
        var principal = service.GetPrincipalFromExpiredToken(tokenString);
        Assert.NotNull(principal);
    }

    [Fact]
    public void GenerateAccessToken_ClockSkewZeroCompatibility_ShouldBeImmediatelyValid()
    {
        var tokenString = _tokenService.GenerateAccessToken("user-clock", "clock@example.com");

        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret)),
            ValidateIssuer = true,
            ValidIssuer = _jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = _jwtSettings.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        var handler = new JwtSecurityTokenHandler();
        var principal = handler.ValidateToken(tokenString, tokenValidationParameters, out var validatedToken);

        Assert.NotNull(principal);
        Assert.NotNull(validatedToken);
    }
}
