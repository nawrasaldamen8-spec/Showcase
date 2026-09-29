using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Career.Common;
using Showcase.Application.Features.Career.Queries;

namespace Showcase.Api.Endpoints.Career.Summary;

public class GetPublicCareer : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/career/public/{username?}", async (
            string? username,
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetPublicCareerQuery(username);
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Career - Summary")
        .WithName(nameof(GetPublicCareer))
        .Produces<PublicCareerDataResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .AllowAnonymous();
    }
}
