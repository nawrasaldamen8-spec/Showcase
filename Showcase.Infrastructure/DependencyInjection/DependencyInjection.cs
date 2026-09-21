using System;
using System.Text;
using Amazon.S3;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Showcase.Application.Common.Interfaces;
using Showcase.Infrastructure.Data;
using Showcase.Infrastructure.HealthChecks;
using Showcase.Infrastructure.Identity;
using Showcase.Infrastructure.Storage;

namespace Showcase.Infrastructure.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(configuration);

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Host=localhost;Database=showcase_db;Username=postgres;Password=postgres";

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(connectionString);
        });

        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

        services.AddIdentityCore<ApplicationUser>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequiredLength = 6;
            options.User.RequireUniqueEmail = true;
        })
        .AddRoles<IdentityRole>()
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

        // Options pattern binding
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.Configure<R2Settings>(configuration.GetSection(R2Settings.SectionName));

        // JWT Authentication & Authorization
        var jwtSettings = configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>() ?? new JwtSettings();
        var secret = !string.IsNullOrWhiteSpace(jwtSettings.Secret) && Encoding.UTF8.GetByteCount(jwtSettings.Secret.Trim()) >= 32
            ? jwtSettings.Secret.Trim()
            : JwtSettings.DefaultDevelopmentSecret;
        var key = Encoding.UTF8.GetBytes(secret);

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = !string.IsNullOrWhiteSpace(jwtSettings.Issuer),
                ValidIssuer = string.IsNullOrWhiteSpace(jwtSettings.Issuer) ? null : jwtSettings.Issuer,
                ValidateAudience = !string.IsNullOrWhiteSpace(jwtSettings.Audience),
                ValidAudience = string.IsNullOrWhiteSpace(jwtSettings.Audience) ? null : jwtSettings.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero,
                ValidAlgorithms = new[] { SecurityAlgorithms.HmacSha256 }
            };
        });

        services.AddAuthorization();

        // Application service registrations
        services.AddHttpContextAccessor();
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        // Cloudflare R2 AWS S3 Client singleton for connection pooling
        services.AddSingleton<IAmazonS3>(sp =>
        {
            var r2Options = sp.GetService<IOptions<R2Settings>>()?.Value ?? new R2Settings();
            var accountId = !string.IsNullOrWhiteSpace(r2Options.AccountId)
                ? r2Options.AccountId.Trim()
                : R2Settings.DefaultDummyAccountId;
            var accessKey = !string.IsNullOrWhiteSpace(r2Options.AccessKeyId)
                ? r2Options.AccessKeyId.Trim()
                : R2Settings.DefaultDummyAccessKey;
            var secretKey = !string.IsNullOrWhiteSpace(r2Options.SecretAccessKey)
                ? r2Options.SecretAccessKey.Trim()
                : R2Settings.DefaultDummySecretKey;

            var config = new AmazonS3Config
            {
                ServiceURL = $"https://{accountId}.r2.cloudflarestorage.com",
                AuthenticationRegion = "auto",
                ForcePathStyle = true
            };

            return new AmazonS3Client(accessKey, secretKey, config);
        });

        services.AddScoped<IStorageService, CloudflareR2StorageService>();

        // Health Checks
        services.AddHealthChecks()
            .AddCheck<PostgreSqlHealthCheck>("postgresql", tags: ["db", "ready"]);

        return services;
    }
}
