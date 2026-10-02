using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Hosting;
using Showcase.Api.Common.Auth;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Auth.Commands.RefreshToken;
using Showcase.Application.Features.Auth.Common;

namespace Showcase.Api.Endpoints.Auth;

public record RefreshTokenRequest(string? AccessToken = null, string? RefreshToken = null);

public class RefreshToken : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/auth/refresh", async (
            RefreshTokenRequest? request,
            ISender sender,
            HttpContext httpContext,
            IWebHostEnvironment env,
            CancellationToken ct) =>
        {
            var accessToken = request?.AccessToken;
            if (string.IsNullOrWhiteSpace(accessToken) && httpContext.Request.Cookies.TryGetValue(AuthCookieHelper.AccessTokenCookieName, out var cookieAccess))
            {
                accessToken = cookieAccess;
            }

            var refreshToken = request?.RefreshToken;
            if (string.IsNullOrWhiteSpace(refreshToken) && httpContext.Request.Cookies.TryGetValue(AuthCookieHelper.RefreshTokenCookieName, out var cookieRefresh))
            {
                refreshToken = cookieRefresh;
            }

            if (string.IsNullOrWhiteSpace(accessToken) || string.IsNullOrWhiteSpace(refreshToken))
            {
                return Results.Unauthorized();
            }

            var command = new RefreshTokenCommand(accessToken, refreshToken);
            var result = await sender.Send(command, ct);
            if (result.IsSuccess)
            {
                var isDev = env.IsDevelopment();
                httpContext.Response.Cookies.Append(
                    AuthCookieHelper.AccessTokenCookieName,
                    result.Value.AccessToken,
                    AuthCookieHelper.GetAccessTokenCookieOptions(isDev));

                httpContext.Response.Cookies.Append(
                    AuthCookieHelper.RefreshTokenCookieName,
                    result.Value.RefreshToken,
                    AuthCookieHelper.GetRefreshTokenCookieOptions(isDev));
            }

            return result.ToResponse();
        })
        .WithTags("Auth")
        .WithName(nameof(RefreshToken))
        .Produces<AuthResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status429TooManyRequests)
        .AllowAnonymous()
        .RequireRateLimiting("auth-policy");
    }
}
