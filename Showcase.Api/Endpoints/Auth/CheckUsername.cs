using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Auth.Queries;

namespace Showcase.Api.Endpoints.Auth;

public class CheckUsername : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/auth/check-username", async (
            string username,
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new CheckUsernameQuery(username);
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Auth")
        .WithName(nameof(CheckUsername))
        .Produces<CheckUsernameResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .AllowAnonymous()
        .RequireRateLimiting("auth-policy");
    }
}

