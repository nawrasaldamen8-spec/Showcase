namespace Showcase.Application.Common.Models;

public class GoogleAuthSettings
{
    public const string SectionName = "GoogleAuth";

    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string RedirectUri { get; set; } = "http://localhost:5118/api/auth/google/callback";
    public string FrontendRedirectUrl { get; set; } = "http://localhost:5173/studio";
}
