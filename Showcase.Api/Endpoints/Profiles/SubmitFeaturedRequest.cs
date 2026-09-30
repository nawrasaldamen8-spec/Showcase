using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Profiles.Commands.SubmitFeaturedRequest;

namespace Showcase.Api.Endpoints.Profiles;

public class SubmitFeaturedRequest : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/profiles/me/featured", async (
            SubmitFeaturedRequestCommand? command,
            ISender sender,
            CancellationToken ct) =>
        {
            var cmd = command ?? new SubmitFeaturedRequestCommand();
            var result = await sender.Send(cmd, ct);
            return result.ToResponse();
        })
        .WithTags("Profiles")
        .WithName(nameof(SubmitFeaturedRequest))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}
