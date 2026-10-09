using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Application.Features.Admin.Users;

namespace Showcase.Api.Endpoints.Admin.Users;

public record ToggleUserFeaturedRequest(bool IsFeatured, string? Note = null);

public class ToggleUserFeatured : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/admin/users/{userId}/featured", async (
            string userId,
            ToggleUserFeaturedRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new ToggleUserFeaturedCommand(userId, request.IsFeatured, request.Note);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Admin - Users")
        .WithName(nameof(ToggleUserFeatured))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization(policy => policy.RequireRole("Admin"));
    }
}
