using System.Collections.Generic;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Career.Common;
using Showcase.Application.Features.Career.Experiences;

namespace Showcase.Api.Endpoints.Career.Experiences;

public class GetExperiences : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/career/experiences", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetExperiencesQuery();
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Career - Experiences")
        .WithName(nameof(GetExperiences))
        .Produces<List<CareerExperienceDto>>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}
