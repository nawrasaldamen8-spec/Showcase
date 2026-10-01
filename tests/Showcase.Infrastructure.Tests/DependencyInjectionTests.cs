using System.Collections.Generic;
using System.Threading.Tasks;
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
            { "Cloudinary:CloudName", "test-cloud" },
            { "Cloudinary:ApiKey", "test-key" },
            { "Cloudinary:ApiSecret", "test-secret" },
            { "Cloudinary:UploadPreset", "test-preset" }
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

        var cloudinaryOptions = provider.GetService<IOptions<CloudinarySettings>>();
        Assert.NotNull(cloudinaryOptions);
        Assert.Equal("test-cloud", cloudinaryOptions.Value.CloudName);
        Assert.Equal("test-key", cloudinaryOptions.Value.ApiKey);
        Assert.Equal("test-preset", cloudinaryOptions.Value.UploadPreset);

        // Assert - Services
        var tokenService = provider.GetService<ITokenService>();
        Assert.NotNull(tokenService);
        Assert.IsType<TokenService>(tokenService);

        var currentUserService = provider.GetService<ICurrentUserService>();
        Assert.NotNull(currentUserService);
        Assert.IsType<CurrentUserService>(currentUserService);

        var storageService = provider.GetService<IStorageService>();
        Assert.NotNull(storageService);
        Assert.IsType<CloudinaryStorageService>(storageService);

        var httpContextAccessor = provider.GetService<IHttpContextAccessor>();
        Assert.NotNull(httpContextAccessor);

        // Assert - Authentication
        var schemeProvider = provider.GetService<IAuthenticationSchemeProvider>();
        Assert.NotNull(schemeProvider);
        var defaultScheme = await schemeProvider.GetDefaultAuthenticateSchemeAsync();
        Assert.NotNull(defaultScheme);
        Assert.Equal(JwtBearerDefaults.AuthenticationScheme, defaultScheme.Name);
    }

    [Fact]
    public void AddInfrastructure_WhenOptionalConfigsOmitted_ShouldUseSafeDefaults()
    {
        // Arrange with minimal configuration
        var configurationData = new Dictionary<string, string?>
        {
            { "ConnectionStrings:DefaultConnection", "Host=localhost;Database=test;Username=postgres;Password=postgres" }
        };

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configurationData)
            .Build();

        var services = new ServiceCollection();

        // Act
        services.AddInfrastructure(configuration);
        var provider = services.BuildServiceProvider();

        // Assert
        var tokenService = provider.GetService<ITokenService>();
        Assert.NotNull(tokenService);

        var storageService = provider.GetService<IStorageService>();
        Assert.NotNull(storageService);
        Assert.IsType<LocalStorageService>(storageService);
    }

    [Fact]
    public void AddInfrastructure_WhenServicesIsNull_ShouldThrowArgumentNullException()
    {
        var configuration = new ConfigurationBuilder().Build();
        Assert.Throws<ArgumentNullException>(() => ((IServiceCollection)null!).AddInfrastructure(configuration));
    }

    [Fact]
    public void AddInfrastructure_WhenConfigurationIsNull_ShouldThrowArgumentNullException()
    {
        var services = new ServiceCollection();
        Assert.Throws<ArgumentNullException>(() => services.AddInfrastructure(null!));
    }

    [Fact]
    public void AddInfrastructure_WhenSecretIsUnder256Bits_ShouldFallbackToDefaultSecretAndNotThrow()
    {
        var configurationData = new Dictionary<string, string?>
        {
            { "ConnectionStrings:DefaultConnection", "Host=localhost;Database=test;Username=postgres;Password=postgres" },
            { "JwtSettings:Secret", "ShortSecret" }
        };

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configurationData)
            .Build();

        var services = new ServiceCollection();
        services.AddInfrastructure(configuration);
        var provider = services.BuildServiceProvider();

        var tokenService = provider.GetService<ITokenService>();
        Assert.NotNull(tokenService);
    }
}
