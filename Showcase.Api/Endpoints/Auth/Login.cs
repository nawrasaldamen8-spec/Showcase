using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Showcase.Api.Common.Auth;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Auth.Commands.Login;
using Showcase.Application.Features.Auth.Common;

namespace Showcase.Api.Endpoints.Auth;

public class Login : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/auth/login", async (
            LoginCommand command,
            ISender sender,
            HttpContext httpContext,
            IWebHostEnvironment env,
            CancellationToken ct) =>
        {
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
        .WithName(nameof(Login))
        .Produces<AuthResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status429TooManyRequests)
        .AllowAnonymous()
        .RequireRateLimiting("auth-policy");
    }
}
