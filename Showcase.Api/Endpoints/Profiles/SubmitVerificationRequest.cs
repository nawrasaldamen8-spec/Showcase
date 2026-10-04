using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Profiles.Commands;

namespace Showcase.Api.Endpoints.Profiles;

public class SubmitVerificationRequest : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/profiles/me/verify", async (
            SubmitVerificationRequestCommand? command,
            ISender sender,
            CancellationToken ct) =>
        {
            var cmd = command ?? new SubmitVerificationRequestCommand();
            var result = await sender.Send(cmd, ct);
            return result.ToResponse();
        })
        .WithTags("Profiles")
        .WithName(nameof(SubmitVerificationRequest))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}

