using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Application.Features.Career.Common;
using Showcase.Application.Features.Career.Queries;

namespace Showcase.Api.Endpoints.Career.Summary;

public class GetCareerSummary : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/career/summary", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetCareerSummaryQuery();
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Career - Summary")
        .WithName(nameof(GetCareerSummary))
        .Produces<CareerSummaryResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}
