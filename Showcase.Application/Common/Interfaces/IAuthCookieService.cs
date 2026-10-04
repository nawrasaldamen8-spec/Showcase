namespace Showcase.Application.Common.Interfaces;

public interface IAuthCookieService
{
    void SetAuthCookies(string accessToken, string refreshToken);
    void ClearAuthCookies();
    string? GetAccessToken();
    string? GetRefreshToken();
}
