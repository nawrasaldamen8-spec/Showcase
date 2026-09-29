using System.Collections.Generic;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Lookups;

namespace Showcase.Api.Endpoints.Lookups;

public class GetCountries : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/lookups/countries", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetCountriesQuery();
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Lookups")
        .WithName(nameof(GetCountries))
        .Produces<IReadOnlyList<CountryDto>>(StatusCodes.Status200OK)
        .AllowAnonymous();
    }
}
