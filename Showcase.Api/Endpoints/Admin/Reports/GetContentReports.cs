using System.Collections.Generic;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Admin.Common;
using Showcase.Application.Features.Admin.Reports;

namespace Showcase.Api.Endpoints.Admin.Reports;

public class GetContentReports : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/admin/reports", async (
            string? status,
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetContentReportsQuery(status);
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Admin - Reports")
        .WithName(nameof(GetContentReports))
        .Produces<IReadOnlyList<ContentReportItemDto>>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .RequireAuthorization(policy => policy.RequireRole("Admin"));
    }
}
