using System.Collections.Generic;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Admin.Users;

namespace Showcase.Api.Endpoints.Admin.Users;

public record UpdateUserRoleRequest(IReadOnlyList<string> Roles);

public class UpdateUserRole : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/admin/users/{userId}/roles", async (
            string userId,
            UpdateUserRoleRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new UpdateUserRoleCommand(userId, request.Roles);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Admin - Users")
        .WithName(nameof(UpdateUserRole))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization(policy => policy.RequireRole("Admin"));
    }
}
