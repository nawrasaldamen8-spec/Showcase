using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

namespace Showcase.Infrastructure.Identity;

public class AuthCookieService(IHttpContextAccessor httpContextAccessor, IWebHostEnvironment env) : IAuthCookieService
{
    public const string AccessTokenCookieName = "showcase_access_token";
    public const string RefreshTokenCookieName = "showcase_refresh_token";

    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly IWebHostEnvironment _env = env;

    public void SetAuthCookies(string accessToken, string refreshToken)
    {
        var response = _httpContextAccessor.HttpContext?.Response;
        if (response is null) return;

        var isDev = _env.IsDevelopment();

        response.Cookies.Append(AccessTokenCookieName, accessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDev,
            SameSite = SameSiteMode.Lax,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddHours(1)
        });

        response.Cookies.Append(RefreshTokenCookieName, refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDev,
            SameSite = SameSiteMode.Lax,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        });
    }

    public void ClearAuthCookies()
    {
        var response = _httpContextAccessor.HttpContext?.Response;
        if (response is null) return;

        var isDev = _env.IsDevelopment();
        var deleteOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDev,
            SameSite = SameSiteMode.Lax,
            Path = "/",
            Expires = DateTimeOffset.UnixEpoch
        };

        response.Cookies.Append(AccessTokenCookieName, string.Empty, deleteOptions);
        response.Cookies.Append(RefreshTokenCookieName, string.Empty, deleteOptions);
    }

    public string? GetAccessToken()
    {
        var request = _httpContextAccessor.HttpContext?.Request;
        return request?.Cookies.TryGetValue(AccessTokenCookieName, out var token) == true && !string.IsNullOrWhiteSpace(token)
            ? token
            : null;
    }

    public string? GetRefreshToken()
    {
        var request = _httpContextAccessor.HttpContext?.Request;
        return request?.Cookies.TryGetValue(RefreshTokenCookieName, out var token) == true && !string.IsNullOrWhiteSpace(token)
            ? token
            : null;
    }
}
