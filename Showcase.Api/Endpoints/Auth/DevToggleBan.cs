using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Application.Features.Auth.Commands;

namespace Showcase.Api.Endpoints.Auth;

public class DevToggleBan : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/auth/dev-toggle-ban", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new ToggleDevBanCommand(), ct);
            return result.ToResponse();
        })
        .WithTags("Auth")
        .WithName(nameof(DevToggleBan))
        .Produces<DevToggleBanResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}

