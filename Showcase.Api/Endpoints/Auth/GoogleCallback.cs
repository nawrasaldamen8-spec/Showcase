using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Application.Features.Auth.Commands;

namespace Showcase.Api.Endpoints.Auth;

public class GoogleCallback : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/auth/google/callback", async (
            string? code,
            string? error,
            string? state,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new HandleGoogleCallbackCommand(code, error, state), ct);
            return Results.Redirect(result.Value.RedirectUrl);
        })
        .WithTags("Auth")
        .WithName(nameof(GoogleCallback))
        .Produces(StatusCodes.Status302Found)
        .AllowAnonymous();
    }
}

