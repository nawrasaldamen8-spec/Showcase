using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Showcase.Domain.Constants;
using Showcase.Domain.Entities;

namespace Showcase.Infrastructure.Data.Seed;

public static class DatabaseSeeder
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static async Task SeedAsync(
        ApplicationDbContext context,
        RoleManager<IdentityRole>? roleManager = null,
        ILogger? logger = null,
        CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(context);

        await SeedCountriesAsync(context, logger, ct);
        await SeedLanguagesAsync(context, logger, ct);
        await SeedSpecialtiesAsync(context, logger, ct);

        if (roleManager is not null)
        {
            await SeedRolesAsync(roleManager, logger);
        }
    }

    private static async Task SeedRolesAsync(
        RoleManager<IdentityRole> roleManager,
        ILogger? logger)
    {
        string[] roles = [AppRoles.Admin, AppRoles.User];
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
                logger?.LogInformation("Created system role: {Role}", role);
            }
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

    private static async Task SeedSpecialtiesAsync(
        ApplicationDbContext context,
        ILogger? logger,
        CancellationToken ct)
    {
        if (await context.SpecialtyReferences.AnyAsync(ct))
            return;

        var json = ReadResource("specialties.json");
        if (string.IsNullOrWhiteSpace(json))
        {
            logger?.LogWarning("specialties.json seed resource could not be found.");
            return;
        }

        var items = JsonSerializer.Deserialize<List<SpecialtySeedDto>>(json, JsonOptions);
        if (items is null || items.Count == 0)
            return;

        var entities = new List<SpecialtyReference>(items.Count);
        foreach (var item in items)
        {
            if (item.id > 0 && !string.IsNullOrWhiteSpace(item.name))
            {
                entities.Add(new SpecialtyReference(item.id, item.code ?? string.Empty, item.name, item.category ?? "General", item.subField ?? string.Empty));
            }
        }

        await context.SpecialtyReferences.AddRangeAsync(entities, ct);
        await context.SaveChangesAsync(ct);
        logger?.LogInformation("Seeded {Count} specialties.", entities.Count);
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
    private sealed record SpecialtySeedDto(int id, string code, string name, string category, string subField);
}
