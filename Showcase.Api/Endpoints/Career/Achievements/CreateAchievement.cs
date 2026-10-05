using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Application.Features.Career.Commands;
using Showcase.Application.Features.Career.Queries;
using Showcase.Application.Features.Career.Common;

namespace Showcase.Api.Endpoints.Career.Achievements;

public class CreateAchievement : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/career/achievements", async (
            CreateAchievementCommand command,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Career - Achievements")
        .WithName(nameof(CreateAchievement))
        .Produces<CareerAchievementDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}

