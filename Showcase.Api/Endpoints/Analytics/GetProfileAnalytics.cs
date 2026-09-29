using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Analytics;

namespace Showcase.Api.Endpoints.Analytics;

public class GetProfileAnalytics : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/analytics/profile", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetProfileAnalyticsQuery();
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Analytics")
        .WithName(nameof(GetProfileAnalytics))
        .Produces<ProfileAnalyticsDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}
