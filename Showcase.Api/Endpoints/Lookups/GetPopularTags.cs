using System.Collections.Generic;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Lookups.Queries;

namespace Showcase.Api.Endpoints.Lookups;

public class GetPopularTags : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/lookups/tags", async (
            int? limit,
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetPopularTagsQuery(limit ?? 20);
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Lookups")
        .WithName(nameof(GetPopularTags))
        .Produces<IReadOnlyList<string>>(StatusCodes.Status200OK)
        .AllowAnonymous();
    }
}
