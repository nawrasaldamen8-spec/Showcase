using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Application.Features.Admin.Common;
using Showcase.Application.Features.Admin.Dashboard;

namespace Showcase.Api.Endpoints.Admin.Dashboard;

public class GetDashboardMetrics : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/admin/dashboard", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetDashboardMetricsQuery();
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Admin - Dashboard")
        .WithName(nameof(GetDashboardMetrics))
        .Produces<AdminDashboardMetricsDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .RequireAuthorization(policy => policy.RequireRole("Admin"));
    }
}
