using System.Collections.Generic;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Showcase.Application.Common.Interfaces;
using Showcase.Infrastructure.DependencyInjection;
using Showcase.Infrastructure.Identity;
using Showcase.Infrastructure.Storage;
using Xunit;

namespace Showcase.Infrastructure.Tests;

public class DependencyInjectionTests
{
    [Fact]
    public async Task AddInfrastructure_ShouldRegisterAllRequiredServicesAndOptions()
    {
        // Arrange
        var configurationData = new Dictionary<string, string?>
        {
            { "ConnectionStrings:DefaultConnection", "Host=localhost;Database=test;Username=postgres;Password=postgres" },
            { "JwtSettings:Secret", "A_Very_Long_And_Secure_Test_Secret_Key_For_Jwt_Verification_12345!" },
            { "JwtSettings:Issuer", "TestIssuer" },
            { "JwtSettings:Audience", "TestAudience" },
            { "JwtSettings:ExpiryMinutes", "45" },
            { "CloudflareR2:AccountId", "test-account" },
            { "CloudflareR2:AccessKeyId", "test-key" },
            { "CloudflareR2:SecretAccessKey", "test-secret" },
            { "CloudflareR2:BucketName", "test-bucket" },
            { "CloudflareR2:PublicUrlPrefix", "https://cdn.example.com" }
        };

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configurationData)
            .Build();

        var services = new ServiceCollection();

        // Act
        services.AddInfrastructure(configuration);
        var provider = services.BuildServiceProvider();

        // Assert - Options
        var jwtOptions = provider.GetService<IOptions<JwtSettings>>();
        Assert.NotNull(jwtOptions);
        Assert.Equal("TestIssuer", jwtOptions.Value.Issuer);
        Assert.Equal("TestAudience", jwtOptions.Value.Audience);
        Assert.Equal(45, jwtOptions.Value.ExpiryMinutes);

        var r2Options = provider.GetService<IOptions<R2Settings>>();
        Assert.NotNull(r2Options);
        Assert.Equal("test-account", r2Options.Value.AccountId);
        Assert.Equal("test-bucket", r2Options.Value.BucketName);
        Assert.Equal("https://cdn.example.com", r2Options.Value.PublicUrlPrefix);

        // Assert - Services
        var tokenService = provider.GetService<ITokenService>();
        Assert.NotNull(tokenService);
        Assert.IsType<TokenService>(tokenService);

        var currentUserService = provider.GetService<ICurrentUserService>();
        Assert.NotNull(currentUserService);
        Assert.IsType<CurrentUserService>(currentUserService);

        var storageService = provider.GetService<IStorageService>();
        Assert.NotNull(storageService);
        Assert.IsType<CloudflareR2StorageService>(storageService);

        var httpContextAccessor = provider.GetService<IHttpContextAccessor>();
        Assert.NotNull(httpContextAccessor);

        // Assert - Authentication
        var schemeProvider = provider.GetService<IAuthenticationSchemeProvider>();
        Assert.NotNull(schemeProvider);
        var defaultScheme = await schemeProvider.GetDefaultAuthenticateSchemeAsync();
        Assert.NotNull(defaultScheme);
        Assert.Equal(JwtBearerDefaults.AuthenticationScheme, defaultScheme.Name);
    }
}
