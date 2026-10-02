using System;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Options;
using Showcase.Infrastructure.Identity;

namespace Showcase.Api.Endpoints.Auth;

public class GoogleLogin : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/auth/google", (
            IOptions<GoogleAuthSettings> googleOptions,
            string? returnUrl) =>
        {
            var options = googleOptions.Value;
            if (string.IsNullOrWhiteSpace(options.ClientId))
            {
                return Results.Problem("Google authentication is not configured.", statusCode: StatusCodes.Status500InternalServerError);
            }

            var redirectUri = UrlEncoder.Default.Encode(options.RedirectUri);
            var state = UrlEncoder.Default.Encode(string.IsNullOrWhiteSpace(returnUrl) ? "/studio" : returnUrl);

            var googleAuthUrl = $"https://accounts.google.com/o/oauth2/v2/auth?" +
                                $"client_id={options.ClientId}&" +
                                $"redirect_uri={redirectUri}&" +
                                $"response_type=code&" +
                                $"scope=openid%20email%20profile&" +
                                $"access_type=offline&" +
                                $"prompt=consent&" +
                                $"state={state}";

            return Results.Redirect(googleAuthUrl);
        })
        .WithTags("Auth")
        .WithName(nameof(GoogleLogin))
        .Produces(StatusCodes.Status302Found)
        .ProducesProblem(StatusCodes.Status500InternalServerError)
        .AllowAnonymous();
    }
}
