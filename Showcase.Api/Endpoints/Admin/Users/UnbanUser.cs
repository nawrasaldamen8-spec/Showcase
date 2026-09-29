using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Admin.Users;

namespace Showcase.Api.Endpoints.Admin.Users;

public class UnbanUser : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/admin/users/{userId}/unban", async (
            string userId,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new UnbanUserCommand(userId);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Admin - Users")
        .WithName(nameof(UnbanUser))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization(policy => policy.RequireRole("Admin"));
    }
}
