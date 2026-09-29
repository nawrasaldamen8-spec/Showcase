using System.Collections.Generic;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Career.Achievements;
using Showcase.Application.Features.Career.Common;

namespace Showcase.Api.Endpoints.Career.Achievements;

public class GetAchievements : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/career/achievements", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetAchievementsQuery();
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Career - Achievements")
        .WithName(nameof(GetAchievements))
        .Produces<List<CareerAchievementDto>>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}
