using System.Collections.Generic;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Career.Common;
using Showcase.Application.Features.Career.Skills;

namespace Showcase.Api.Endpoints.Career.Skills;

public class GetSkills : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/career/skills", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetSkillsQuery();
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Career - Skills")
        .WithName(nameof(GetSkills))
        .Produces<List<CareerSkillDto>>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}
