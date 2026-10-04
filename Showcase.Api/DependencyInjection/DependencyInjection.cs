using System.Reflection;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Showcase.Api.Common.Errors;
using Showcase.Api.Endpoints;

namespace Showcase.Api.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddApi(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddOpenApiDocumentation();
        services.AddWebConfiguration();
        services.AddCorsPolicy(configuration);
        services.AddRateLimitingPolicies();

        return services;
    }

    private static void AddWebConfiguration(this IServiceCollection services)
    {
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();

        services.ConfigureHttpJsonOptions(options =>
        {
            options.SerializerOptions.Converters.Add(
                new System.Text.Json.Serialization.JsonStringEnumConverter(
                    System.Text.Json.JsonNamingPolicy.CamelCase));
        });

        services.AddEndpoints(Assembly.GetExecutingAssembly());
    }
}
