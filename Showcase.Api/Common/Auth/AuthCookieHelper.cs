using System;
using Microsoft.AspNetCore.Http;

namespace Showcase.Api.Common.Auth;

public static class AuthCookieHelper
{
    public const string AccessTokenCookieName = "showcase_access_token";
    public const string RefreshTokenCookieName = "showcase_refresh_token";

    public static CookieOptions GetAccessTokenCookieOptions(bool isDevelopment) => new()
    {
        HttpOnly = true,
        Secure = !isDevelopment,
        SameSite = SameSiteMode.Lax,
        Path = "/",
        Expires = DateTimeOffset.UtcNow.AddHours(1)
    };

    public static CookieOptions GetRefreshTokenCookieOptions(bool isDevelopment) => new()
    {
        HttpOnly = true,
        Secure = !isDevelopment,
        SameSite = SameSiteMode.Lax,
        Path = "/",
        Expires = DateTimeOffset.UtcNow.AddDays(7)
    };

    public static CookieOptions GetDeleteCookieOptions(bool isDevelopment) => new()
    {
        HttpOnly = true,
        Secure = !isDevelopment,
        SameSite = SameSiteMode.Lax,
        Path = "/",
        Expires = DateTimeOffset.UnixEpoch
    };
}
