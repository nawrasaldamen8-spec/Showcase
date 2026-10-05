using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.IdentityModel.Tokens;
using Showcase.Infrastructure.Data;
using Showcase.Infrastructure.HealthChecks;
using Showcase.Infrastructure.Hubs;
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

        AddDatabase(services, configuration);
        AddJwtAuthentication(services, configuration);
        AddApplicationServices(services, configuration);
        AddInfrastructureHealthChecks(services);

        return services;
    }

    private static void AddDatabase(IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Host=localhost;Database=showcase_db;Username=postgres;Password=postgres";

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(connectionString);
            options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
        });

        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

        services.AddIdentityCore<ApplicationUser>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequiredLength = 6;
            // Email is optional; uniqueness is enforced in IdentityService.RegisterUserAsync when one is supplied.
            options.User.RequireUniqueEmail = false;
        })
        .AddRoles<IdentityRole>()
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();
    }

    private static void AddJwtAuthentication(IServiceCollection services, IConfiguration configuration)
    {
        // Options pattern binding
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.Configure<CloudinarySettings>(configuration.GetSection(CloudinarySettings.SectionName));
        services.Configure<GoogleAuthSettings>(configuration.GetSection(GoogleAuthSettings.SectionName));
        services.AddHttpClient();

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
            options.RequireHttpsMetadata = !string.Equals(configuration["ASPNETCORE_ENVIRONMENT"], "Development", StringComparison.OrdinalIgnoreCase);
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
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;
                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                    {
                        context.Token = accessToken;
                        return Task.CompletedTask;
                    }

                    if (context.Request.Cookies.TryGetValue("showcase_access_token", out var cookieToken) && !string.IsNullOrWhiteSpace(cookieToken))
                    {
                        context.Token = cookieToken;
                        return Task.CompletedTask;
                    }

                    return Task.CompletedTask;
                }
            };
        });

        services.AddAuthorization();
        services.AddSignalR();
        services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();
    }

    private static void AddApplicationServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpContextAccessor();
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddHttpClient<IGoogleAuthService, GoogleAuthService>();
        services.AddScoped<IAuthCookieService, AuthCookieService>();
        services.AddScoped<IAuthSessionOrchestrator, AuthSessionOrchestrator>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IRealtimeNotifier, SignalRRealtimeNotifier>();
        services.AddScoped<IAuditLogger, Showcase.Infrastructure.Services.AuditLogger>();

        // Cloudinary vs Local Storage Service Registration
        var cloudinaryConfig = configuration.GetSection(CloudinarySettings.SectionName).Get<CloudinarySettings>();
        var isCloudinaryConfigured = cloudinaryConfig is not null
            && !string.IsNullOrWhiteSpace(cloudinaryConfig.CloudName)
            && !cloudinaryConfig.CloudName.StartsWith("your-", StringComparison.OrdinalIgnoreCase)
            && !string.IsNullOrWhiteSpace(cloudinaryConfig.ApiKey)
            && !cloudinaryConfig.ApiKey.StartsWith("your-", StringComparison.OrdinalIgnoreCase)
            && !string.IsNullOrWhiteSpace(cloudinaryConfig.ApiSecret)
            && !cloudinaryConfig.ApiSecret.StartsWith("your-", StringComparison.OrdinalIgnoreCase);

        if (isCloudinaryConfigured)
        {
            services.AddScoped<IStorageService, CloudinaryStorageService>();
        }
        else
        {
            services.AddScoped<IStorageService, LocalStorageService>();
        }
    }

    private static void AddInfrastructureHealthChecks(IServiceCollection services)
    {
        services.AddHealthChecks()
            .AddCheck<PostgreSqlHealthCheck>("postgresql", tags: ["db", "ready"]);
    }
}
