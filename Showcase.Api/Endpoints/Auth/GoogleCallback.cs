using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Showcase.Api.Common.Auth;
using Showcase.Application.Common.Interfaces;
using Showcase.Infrastructure.Identity;

namespace Showcase.Api.Endpoints.Auth;

public class GoogleCallback : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/auth/google/callback", async (
            string? code,
            string? error,
            string? state,
            IHttpClientFactory httpClientFactory,
            IOptions<GoogleAuthSettings> googleOptions,
            IIdentityService identityService,
            ITokenService tokenService,
            HttpContext httpContext,
            IWebHostEnvironment env,
            ILogger<GoogleCallback> logger,
            CancellationToken ct) =>
        {
            var options = googleOptions.Value;
            var frontendBase = options.FrontendRedirectUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase)
                ? new Uri(options.FrontendRedirectUrl).GetLeftPart(UriPartial.Authority)
                : "http://localhost:5173";
            var fallbackLoginUrl = $"{frontendBase}/login";

            if (!string.IsNullOrWhiteSpace(error) || string.IsNullOrWhiteSpace(code))
            {
                logger.LogWarning("Google OAuth returned error or missing code: {Error}", error);
                return Results.Redirect($"{fallbackLoginUrl}?error={UrlEncoder.Default.Encode(error ?? "Google authorization was cancelled.")}");
            }

            try
            {
                // 1. Exchange authorization code for access token
                using var client = httpClientFactory.CreateClient();
                var tokenParams = new Dictionary<string, string>
                {
                    ["code"] = code,
                    ["client_id"] = options.ClientId,
                    ["client_secret"] = options.ClientSecret,
                    ["redirect_uri"] = options.RedirectUri,
                    ["grant_type"] = "authorization_code"
                };

                var tokenResponse = await client.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(tokenParams), ct);
                if (!tokenResponse.IsSuccessStatusCode)
                {
                    var tokenError = await tokenResponse.Content.ReadAsStringAsync(ct);
                    logger.LogError("Failed to exchange code with Google: {TokenError}", tokenError);
                    return Results.Redirect($"{fallbackLoginUrl}?error={UrlEncoder.Default.Encode("Failed to exchange authorization token with Google.")}");
                }

                var tokenJson = await tokenResponse.Content.ReadAsStringAsync(ct);
                using var tokenDoc = JsonDocument.Parse(tokenJson);
                if (!tokenDoc.RootElement.TryGetProperty("access_token", out var accessTokenProp))
                {
                    return Results.Redirect($"{fallbackLoginUrl}?error={UrlEncoder.Default.Encode("Invalid response from Google token exchange service.")}");
                }
                var googleAccessToken = accessTokenProp.GetString();

                // 2. Fetch User Profile Info from OpenID Connect userinfo endpoint
                using var userinfoRequest = new HttpRequestMessage(HttpMethod.Get, "https://openidconnect.googleapis.com/v1/userinfo");
                userinfoRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", googleAccessToken);

                var userinfoResponse = await client.SendAsync(userinfoRequest, ct);
                if (!userinfoResponse.IsSuccessStatusCode)
                {
                    logger.LogError("Failed to fetch Google userinfo: {StatusCode}", userinfoResponse.StatusCode);
                    return Results.Redirect($"{fallbackLoginUrl}?error={UrlEncoder.Default.Encode("Failed to retrieve Google profile information.")}");
                }

                var userinfoJson = await userinfoResponse.Content.ReadAsStringAsync(ct);
                using var userinfoDoc = JsonDocument.Parse(userinfoJson);
                var root = userinfoDoc.RootElement;

                var googleSub = root.TryGetProperty("sub", out var subProp) ? subProp.GetString() : null;
                var email = root.TryGetProperty("email", out var emailProp) ? emailProp.GetString() : null;
                var name = root.TryGetProperty("name", out var nameProp) ? nameProp.GetString() : null;
                var picture = root.TryGetProperty("picture", out var picProp) ? picProp.GetString() : null;

                if (string.IsNullOrWhiteSpace(googleSub) || string.IsNullOrWhiteSpace(email))
                {
                    return Results.Redirect($"{fallbackLoginUrl}?error={UrlEncoder.Default.Encode("Incomplete user information received from Google.")}");
                }

                // 3. Provision or Retrieve User in Identity and Domain
                var userResult = await identityService.GetOrCreateExternalUserAsync(
                    "Google",
                    googleSub,
                    email,
                    name ?? email.Split('@')[0],
                    picture,
                    ct);

                if (userResult.IsFailure)
                {
                    logger.LogWarning("External user provisioning failed: {Error}", userResult.Error.Description);
                    return Results.Redirect($"{fallbackLoginUrl}?error={UrlEncoder.Default.Encode(userResult.Error.Description)}");
                }

                var user = userResult.Value;

                // 4. Generate JWT & Refresh Tokens
                var jwtToken = tokenService.GenerateAccessToken(user.Id, user.UserName, user.Email, user.Roles);
                var refreshToken = tokenService.GenerateRefreshToken();
                await identityService.UpdateRefreshTokenAsync(user.Id, refreshToken, DateTime.UtcNow.AddDays(7), ct);

                // 5. Append HttpOnly Cookies
                var isDev = env.IsDevelopment();
                httpContext.Response.Cookies.Append(
                    AuthCookieHelper.AccessTokenCookieName,
                    jwtToken,
                    AuthCookieHelper.GetAccessTokenCookieOptions(isDev));

                httpContext.Response.Cookies.Append(
                    AuthCookieHelper.RefreshTokenCookieName,
                    refreshToken,
                    AuthCookieHelper.GetRefreshTokenCookieOptions(isDev));

                // 6. Redirect to frontend target
                var targetState = !string.IsNullOrWhiteSpace(state) ? Uri.UnescapeDataString(state) : "/studio";
                if (!targetState.StartsWith("/"))
                {
                    targetState = "/studio";
                }

                var finalRedirectUrl = $"{frontendBase}{targetState}";
                return Results.Redirect(finalRedirectUrl);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error during Google OAuth callback processing.");
                return Results.Redirect($"{fallbackLoginUrl}?error={UrlEncoder.Default.Encode("An unexpected error occurred during Google sign-in.")}");
            }
        })
        .WithTags("Auth")
        .WithName(nameof(GoogleCallback))
        .Produces(StatusCodes.Status302Found)
        .AllowAnonymous();
    }
}
