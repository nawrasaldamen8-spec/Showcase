using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Auth.Queries.GetCurrentUser;

namespace Showcase.Api.Endpoints.Auth;

public class GetCurrentUser : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/auth/me", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new GetCurrentUserQuery(), ct);
            return result.ToResponse();
        })
        .WithTags("Auth")
        .WithName(nameof(GetCurrentUser))
        .Produces<CurrentUserResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}
