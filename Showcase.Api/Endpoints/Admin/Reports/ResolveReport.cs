using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Application.Features.Admin.Reports;

namespace Showcase.Api.Endpoints.Admin.Reports;

public record ResolveReportRequest(string ActionTaken);

public class ResolveReport : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/admin/reports/{id:guid}/resolve", async (
            Guid id,
            ResolveReportRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new ResolveReportCommand(id, request.ActionTaken);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Admin - Reports")
        .WithName(nameof(ResolveReport))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization(policy => policy.RequireRole("Admin"));
    }
}
