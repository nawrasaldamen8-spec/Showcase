using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Showcase.Infrastructure.Data;
using Showcase.Infrastructure.Data.Seed;

namespace Showcase.Api.DependencyInjection;

public static class DatabaseExtensions
{
    public static async Task InitialiseDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<Program>>();

        try
        {
            var context = services.GetRequiredService<ApplicationDbContext>();
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

            await context.Database.MigrateAsync();
            await DatabaseSeeder.SeedAsync(context, roleManager, logger);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during database migration/seeding.");
        }
    }
}
