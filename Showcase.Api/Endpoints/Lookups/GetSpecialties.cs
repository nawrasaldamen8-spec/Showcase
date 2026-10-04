using System.Collections.Generic;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Lookups.Queries;

namespace Showcase.Api.Endpoints.Lookups;

public class GetSpecialties : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/lookups/specialties", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetSpecialtiesQuery();
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Lookups")
        .WithName(nameof(GetSpecialties))
        .Produces<IReadOnlyList<SpecialtyCategoryDto>>(StatusCodes.Status200OK)
        .AllowAnonymous();
    }
}
