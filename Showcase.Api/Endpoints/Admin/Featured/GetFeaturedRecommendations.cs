using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Application.Features.Admin.Common;
using Showcase.Application.Features.Admin.Featured;

namespace Showcase.Api.Endpoints.Admin.Featured;

public class GetFeaturedRecommendations : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/admin/featured", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetFeaturedRecommendationsQuery();
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Admin - Featured")
        .WithName(nameof(GetFeaturedRecommendations))
        .Produces<IReadOnlyList<FeaturedRecommendationItemDto>>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .RequireAuthorization(policy => policy.RequireRole("Admin"));
    }
}
