using System.Reflection;
using Microsoft.OpenApi;
using Showcase.Api.Common.Errors;
using Showcase.Api.Endpoints;

namespace Showcase.Api.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddApi(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Showcase Portfolio API",
                Version = "v1",
                Description = "Showcase Portfolio Platform Backend API (.NET 10)"
            });

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Description = "Enter JWT Bearer token like: Bearer {your token}",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT"
            });

            options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference("Bearer", document)] = []
            });
        });

        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();

        services.AddEndpoints(Assembly.GetExecutingAssembly());

        services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            });
        });

        return services;
    }
}
