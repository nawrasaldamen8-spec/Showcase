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

public class GetCareerVisibility : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/career/visibility", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetCareerVisibilityQuery();
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Career - Visibility")
        .WithName(nameof(GetCareerVisibility))
        .Produces<CareerVisibilityDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}

