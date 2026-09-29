using System.Collections.Generic;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Profiles.Common;
using Showcase.Application.Features.Profiles.Queries.GetProfiles;

namespace Showcase.Api.Endpoints.Profiles;

public class GetProfiles : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/profiles", async (
            string? search,
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetProfilesQuery(search);
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Profiles")
        .WithName(nameof(GetProfiles))
        .Produces<IReadOnlyList<PublicProfileResponse>>(StatusCodes.Status200OK)
        .AllowAnonymous();
    }
}
