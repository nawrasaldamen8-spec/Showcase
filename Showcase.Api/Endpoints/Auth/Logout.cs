using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Showcase.Api.Common.Auth;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Auth.Commands.Logout;

namespace Showcase.Api.Endpoints.Auth;

public class Logout : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/auth/logout", async (
            ISender sender,
            HttpContext httpContext,
            IWebHostEnvironment env,
            CancellationToken ct) =>
        {
            if (httpContext.User.Identity?.IsAuthenticated == true)
            {
                await sender.Send(new LogoutCommand(), ct);
            }

            var isDev = env.IsDevelopment();
            httpContext.Response.Cookies.Append(
                AuthCookieHelper.AccessTokenCookieName,
                "",
                AuthCookieHelper.GetDeleteCookieOptions(isDev));

            httpContext.Response.Cookies.Append(
                AuthCookieHelper.RefreshTokenCookieName,
                "",
                AuthCookieHelper.GetDeleteCookieOptions(isDev));

            return Results.Ok();
        })
        .WithTags("Auth")
        .WithName(nameof(Logout))
        .WithSummary("Logout current user and revoke refresh token")
        .WithDescription("Clears the stored refresh token and expiration for the authenticated user and deletes cookies.")
        .Produces(StatusCodes.Status200OK)
        .AllowAnonymous();
    }
}
