using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Application.Features.Admin.Common;
using Showcase.Application.Features.Admin.Dashboard;

namespace Showcase.Api.Endpoints.Admin.Dashboard;

public class GetAuditLogs : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/admin/audit-logs", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetAuditLogsQuery();
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Admin - Dashboard")
        .WithName(nameof(GetAuditLogs))
        .Produces<IReadOnlyList<AuditLogItemDto>>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .RequireAuthorization(policy => policy.RequireRole("Admin"));
    }
}
