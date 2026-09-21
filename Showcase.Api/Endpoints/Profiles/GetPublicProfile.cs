using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Profiles.Common;
using Showcase.Application.Features.Profiles.Queries.GetPublicProfile;

namespace Showcase.Api.Endpoints.Profiles;

public class GetPublicProfile : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/profiles/{username}", async (
            string username,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new GetPublicProfileQuery(username), ct);
            return result.ToResponse();
        })
        .WithTags("Profiles")
        .WithName(nameof(GetPublicProfile))
        .Produces<PublicProfileResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .AllowAnonymous();
    }
}
