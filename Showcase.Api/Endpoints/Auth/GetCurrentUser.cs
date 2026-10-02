using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Auth.Queries.GetCurrentUser;

namespace Showcase.Api.Endpoints.Auth;

public class GetCurrentUser : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/auth/me", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new GetCurrentUserQuery(), ct);
            return result.ToResponse();
        })
        .WithTags("Auth")
        .WithName(nameof(GetCurrentUser))
        .Produces<CurrentUserResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();

        app.MapPost("api/auth/dev-toggle-ban", async (
            Showcase.Application.Common.Interfaces.ICurrentUserService currentUserService,
            Showcase.Application.Common.Interfaces.IApplicationDbContext context,
            CancellationToken ct) =>
        {
            var userId = currentUserService.UserId;
            if (string.IsNullOrEmpty(userId))
                return Results.Unauthorized();

            var profile = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(
                context.Profiles.IgnoreQueryFilters(),
                p => p.UserId == userId,
                ct);

            if (profile is null)
                return Results.NotFound();

            if (profile.IsBanned)
            {
                profile.Unban();
            }
            else
            {
                profile.Ban("Violation of platform community guidelines: repetitive distribution of unverified external media.");
            }

            await context.SaveChangesAsync(ct);
            return Results.Ok(new { isBanned = profile.IsBanned, banReason = profile.BanReason });
        })
        .WithTags("Auth")
        .RequireAuthorization();
    }
}
