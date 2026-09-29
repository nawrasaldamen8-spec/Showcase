using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Common.Extensions;

public static class ProfileQueryExtensions
{
    public static async Task<Result<Profile>> GetActiveProfileByUserIdAsync(
        this IApplicationDbContext context,
        string? userId,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        var profile = await context.Profiles
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);

        if (profile is null)
            return ProfileErrors.NotFoundForUser(userId);

        return profile;
    }

    public static async Task<Result<Profile>> GetProfileWithCareerVisibilityAsync(
        this IApplicationDbContext context,
        string? userId,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        var profile = await context.Profiles
            .Include(p => p.CareerVisibility)
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);

        if (profile is null)
            return ProfileErrors.NotFoundForUser(userId);

        return profile;
    }
}
