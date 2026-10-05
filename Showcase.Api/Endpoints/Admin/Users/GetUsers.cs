using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Application.Features.Admin.Common;
using Showcase.Application.Features.Admin.Users;

namespace Showcase.Api.Endpoints.Admin.Users;

public class GetUsers : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/admin/users", async (
            string? search,
            string? status,
            string? role,
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetUsersQuery(search, status, role);
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Admin - Users")
        .WithName(nameof(GetUsers))
        .Produces<IReadOnlyList<AdminUserListItemDto>>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .RequireAuthorization(policy => policy.RequireRole("Admin"));
    }
}
