using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Application.Features.Auth.Queries;

namespace Showcase.Api.Endpoints.Auth;

public class GoogleLogin : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/auth/google", async (
            string? returnUrl,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new GetGoogleAuthUrlQuery(returnUrl), ct);
            if (result.IsFailure)
            {
                return result.ToResponse();
            }

            return Results.Redirect(result.Value.Url);
        })
        .WithTags("Auth")
        .WithName(nameof(GoogleLogin))
        .Produces(StatusCodes.Status302Found)
        .ProducesProblem(StatusCodes.Status500InternalServerError)
        .AllowAnonymous();
    }
}

