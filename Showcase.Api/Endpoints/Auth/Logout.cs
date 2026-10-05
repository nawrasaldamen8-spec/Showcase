using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Application.Features.Auth.Commands;

namespace Showcase.Api.Endpoints.Auth;

public class Logout : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/auth/logout", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new LogoutCommand(), ct);
            return result.ToResponse();
        })
        .WithTags("Auth")
        .WithName(nameof(Logout))
        .WithSummary("Logout current user and revoke refresh token")
        .WithDescription("Clears the stored refresh token and expiration for the authenticated user and deletes cookies.")
        .Produces(StatusCodes.Status200OK)
        .AllowAnonymous();
    }
}

