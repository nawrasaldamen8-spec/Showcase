using System;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Career.Common;
using Showcase.Application.Features.Career.Skills;

namespace Showcase.Api.Endpoints.Career.Skills;

public record UpdateSkillRequest(
    string Name,
    string? Category = null);

public class UpdateSkill : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/career/skills/{id:guid}", async (
            Guid id,
            UpdateSkillRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new UpdateSkillCommand(id, request.Name, request.Category);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Career - Skills")
        .WithName(nameof(UpdateSkill))
        .Produces<CareerSkillDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}
