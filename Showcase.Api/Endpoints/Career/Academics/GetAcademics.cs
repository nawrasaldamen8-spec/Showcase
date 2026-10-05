using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Application.Features.Career.Commands;
using Showcase.Application.Features.Career.Queries;
using Showcase.Application.Features.Career.Common;

namespace Showcase.Api.Endpoints.Career.Academics;

public class GetAcademics : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/career/academics", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetAcademicsQuery();
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Career - Academics")
        .WithName(nameof(GetAcademics))
        .Produces<List<CareerAcademicDto>>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}

