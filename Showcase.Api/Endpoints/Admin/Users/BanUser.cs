using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Admin.Users;

namespace Showcase.Api.Endpoints.Admin.Users;

public record BanUserRequest(string Reason);

public class BanUser : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/admin/users/{userId}/ban", async (
            string userId,
            BanUserRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new BanUserCommand(userId, request.Reason);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Admin - Users")
        .WithName(nameof(BanUser))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization(policy => policy.RequireRole("Admin"));
    }
}
