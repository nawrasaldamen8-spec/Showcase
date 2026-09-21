using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Auth.Commands.Logout;

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
        .WithDescription("Clears the stored refresh token and expiration for the authenticated user.")
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}
