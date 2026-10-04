using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Career.Common;
using Showcase.Application.Features.Career.Commands;
using Showcase.Application.Features.Career.Queries;

namespace Showcase.Api.Endpoints.Career.Visibility;

public record ToggleSectionVisibilityRequest(bool IsVisible);

public class ToggleSectionVisibility : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/career/visibility/{section}", async (
            string section,
            ToggleSectionVisibilityRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new ToggleSectionVisibilityCommand(section, request.IsVisible);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Career - Visibility")
        .WithName(nameof(ToggleSectionVisibility))
        .Produces<CareerVisibilityDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}

