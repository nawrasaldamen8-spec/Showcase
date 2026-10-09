using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
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
            [Microsoft.AspNetCore.Mvc.FromBody] ToggleSectionVisibilityRequest? request,
            ISender sender,
            CancellationToken ct) =>
        {
            if (request is null)
                return Results.BadRequest(new Microsoft.AspNetCore.Mvc.ProblemDetails { Title = "Invalid Request", Detail = "Request body is required." });

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

