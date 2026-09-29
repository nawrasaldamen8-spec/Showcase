using System;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Career.Achievements;
using Showcase.Application.Features.Career.Common;

namespace Showcase.Api.Endpoints.Career.Achievements;

public record UpdateAchievementRequest(
    string Title,
    string? Type = null,
    string? Organization = null,
    string? Date = null,
    string? Url = null,
    string? MediaUrl = null,
    string? Description = null);

public class UpdateAchievement : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/career/achievements/{id:guid}", async (
            Guid id,
            UpdateAchievementRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new UpdateAchievementCommand(
                id,
                request.Title,
                request.Type,
                request.Organization,
                request.Date,
                request.Url,
                request.MediaUrl,
                request.Description);

            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Career - Achievements")
        .WithName(nameof(UpdateAchievement))
        .Produces<CareerAchievementDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}
