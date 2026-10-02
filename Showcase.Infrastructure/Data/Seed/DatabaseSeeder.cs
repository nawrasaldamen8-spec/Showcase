using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Showcase.Domain.Entities;

using Microsoft.AspNetCore.Identity;
using Showcase.Infrastructure.Identity;

namespace Showcase.Infrastructure.Data.Seed;

public static class DatabaseSeeder
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static async Task SeedAsync(
        ApplicationDbContext context,
        UserManager<ApplicationUser>? userManager = null,
        RoleManager<IdentityRole>? roleManager = null,
        ILogger? logger = null,
        CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(context);

        await SeedCountriesAsync(context, logger, ct);
        await SeedLanguagesAsync(context, logger, ct);

        if (userManager is not null && roleManager is not null)
        {
            await SeedRolesAndAdminAsync(context, userManager, roleManager, logger, ct);
        }
    }

    private static async Task SeedRolesAndAdminAsync(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        ILogger? logger,
        CancellationToken ct)
    {
        string[] roles = ["Admin", "Member", "Moderator"];
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
                logger?.LogInformation("Created role: {Role}", role);
            }
        }

        const string adminUsername = "admin";
        const string adminEmail = "admin@showcase.com";
        const string adminPassword = "Admin@123456";

        var adminUser = await userManager.FindByNameAsync(adminUsername);
        if (adminUser is null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminUsername,
                Email = adminEmail,
                EmailConfirmed = true
            };

            var createResult = await userManager.CreateAsync(adminUser, adminPassword);
            if (createResult.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
                logger?.LogInformation("Created default admin user '{Username}'", adminUsername);
            }
        }
        else
        {
            if (!await userManager.IsInRoleAsync(adminUser, "Admin"))
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }

        // Ensure Profile exists for admin user
        var adminProfile = await context.Profiles.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.UserId == adminUser.Id, ct);
        if (adminProfile is null)
        {
            var profile = new Profile(adminUser.Id, "System Administrator", "Platform Admin", "Jordan");
            await context.Profiles.AddAsync(profile, ct);
            await context.SaveChangesAsync(ct);
            logger?.LogInformation("Created Profile entity for admin user.");
        }

        // Seed sample notifications for admin if none exist
        if (!await context.Notifications.AnyAsync(n => n.UserId == adminUser.Id, ct))
        {
            var notif1 = new Notification(
                adminUser.Id,
                Domain.Enums.NotificationType.Like,
                "Like",
                "liked your project",
                null,
                "nawras");
            var notif2 = new Notification(
                adminUser.Id,
                Domain.Enums.NotificationType.VerificationApproved,
                "Verification Approved",
                "Your studio verification badge has been activated!");
            var notif3 = new Notification(
                adminUser.Id,
                Domain.Enums.NotificationType.FeaturedApproved,
                "Featured Spotlight",
                "Your architectural portfolio is featured on the discovery feed!");

            await context.Notifications.AddRangeAsync(new[] { notif1, notif2, notif3 }, ct);
            await context.SaveChangesAsync(ct);
        }
    }

    private static async Task SeedCountriesAsync(
        ApplicationDbContext context,
        ILogger? logger,
        CancellationToken ct)
    {
        if (await context.Countries.AnyAsync(ct))
            return;

        var json = ReadResource("countries.json");
        if (string.IsNullOrWhiteSpace(json))
        {
            logger?.LogWarning("countries.json seed resource could not be found.");
            return;
        }

        var items = JsonSerializer.Deserialize<List<CountrySeedDto>>(json, JsonOptions);
        if (items is null || items.Count == 0)
            return;

        var entities = new List<Country>(items.Count);
        foreach (var item in items)
        {
            if (item.id > 0 && !string.IsNullOrWhiteSpace(item.alpha2) && !string.IsNullOrWhiteSpace(item.name))
            {
                entities.Add(new Country(item.id, item.alpha2, item.alpha3, item.name));
            }
        }

        await context.Countries.AddRangeAsync(entities, ct);
        await context.SaveChangesAsync(ct);
        logger?.LogInformation("Seeded {Count} countries.", entities.Count);
    }

    private static async Task SeedLanguagesAsync(
        ApplicationDbContext context,
        ILogger? logger,
        CancellationToken ct)
    {
        if (await context.LanguageReferences.AnyAsync(ct))
            return;

        var json = ReadResource("languages.json");
        if (string.IsNullOrWhiteSpace(json))
        {
            logger?.LogWarning("languages.json seed resource could not be found.");
            return;
        }

        var items = JsonSerializer.Deserialize<List<LanguageSeedDto>>(json, JsonOptions);
        if (items is null || items.Count == 0)
            return;

        var entities = new List<LanguageReference>(items.Count);
        foreach (var item in items)
        {
            if (!string.IsNullOrWhiteSpace(item.code) && !string.IsNullOrWhiteSpace(item.name))
            {
                entities.Add(new LanguageReference(item.code, item.name));
            }
        }

        await context.LanguageReferences.AddRangeAsync(entities, ct);
        await context.SaveChangesAsync(ct);
        logger?.LogInformation("Seeded {Count} languages.", entities.Count);
    }

    private static string? ReadResource(string fileName)
    {
        var assembly = Assembly.GetExecutingAssembly();
        var resourceName = $"Showcase.Infrastructure.Data.Seed.{fileName}";

        using var stream = assembly.GetManifestResourceStream(resourceName);
        if (stream is not null)
        {
            using var reader = new StreamReader(stream);
            return reader.ReadToEnd();
        }

        // Fallback to disk if running locally or not embedded
        var fallbackPath = Path.Combine(AppContext.BaseDirectory, "Data", "Seed", fileName);
        if (File.Exists(fallbackPath))
        {
            return File.ReadAllText(fallbackPath);
        }

        var relativePath = Path.Combine("Showcase.Infrastructure", "Data", "Seed", fileName);
        if (File.Exists(relativePath))
        {
            return File.ReadAllText(relativePath);
        }

        if (File.Exists(fileName))
        {
            return File.ReadAllText(fileName);
        }

        return null;
    }

    private sealed record CountrySeedDto(int id, string alpha2, string alpha3, string name);
    private sealed record LanguageSeedDto(string code, string name);
}
