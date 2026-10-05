namespace Showcase.Infrastructure.Identity;

public class GoogleAuthService(
    HttpClient httpClient,
    IOptions<GoogleAuthSettings> googleOptions,
    ILogger<GoogleAuthService> logger) : IGoogleAuthService
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly IOptions<GoogleAuthSettings> _googleOptions = googleOptions;
    private readonly ILogger<GoogleAuthService> _logger = logger;

    public async Task<Result<GoogleUserInfo>> ExchangeCodeForUserInfoAsync(string code, CancellationToken ct)
    {
        var options = _googleOptions.Value;
        if (string.IsNullOrWhiteSpace(options.ClientId) || string.IsNullOrWhiteSpace(options.ClientSecret))
        {
            _logger.LogError("Google OAuth configuration is missing ClientId or ClientSecret.");
            return Error.Failure("Auth.GoogleNotConfigured", "Google authentication is not properly configured.");
        }

        try
        {
            // 1. Exchange authorization code for access token
            var tokenParams = new Dictionary<string, string>
            {
                ["code"] = code,
                ["client_id"] = options.ClientId,
                ["client_secret"] = options.ClientSecret,
                ["redirect_uri"] = options.RedirectUri,
                ["grant_type"] = "authorization_code"
            };

            var tokenResponse = await _httpClient.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(tokenParams), ct);
            if (!tokenResponse.IsSuccessStatusCode)
            {
                var tokenError = await tokenResponse.Content.ReadAsStringAsync(ct);
                _logger.LogError("Failed to exchange code with Google: {TokenError}", tokenError);
                return Error.Failure("Auth.GoogleTokenExchangeFailed", "Failed to exchange authorization token with Google.");
            }

            var tokenJson = await tokenResponse.Content.ReadAsStringAsync(ct);
            using var tokenDoc = JsonDocument.Parse(tokenJson);
            if (!tokenDoc.RootElement.TryGetProperty("access_token", out var accessTokenProp))
            {
                return Error.Failure("Auth.GoogleInvalidResponse", "Invalid response from Google token exchange service.");
            }

            var googleAccessToken = accessTokenProp.GetString();
            if (string.IsNullOrWhiteSpace(googleAccessToken))
            {
                return Error.Failure("Auth.GoogleInvalidToken", "Received empty access token from Google.");
            }

            // 2. Fetch User Profile Info from OpenID Connect userinfo endpoint
            using var userinfoRequest = new HttpRequestMessage(HttpMethod.Get, "https://openidconnect.googleapis.com/v1/userinfo");
            userinfoRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", googleAccessToken);

            var userinfoResponse = await _httpClient.SendAsync(userinfoRequest, ct);
            if (!userinfoResponse.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to fetch Google userinfo: {StatusCode}", userinfoResponse.StatusCode);
                return Error.Failure("Auth.GoogleUserInfoFailed", "Failed to retrieve Google profile information.");
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
                return Error.Failure("Auth.GoogleIncompleteProfile", "Incomplete user information received from Google.");
            }

            return new GoogleUserInfo(googleSub, email, name, picture);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during Google OAuth token exchange / userinfo retrieval.");
            return Error.Failure("Auth.GoogleUnexpectedError", "An unexpected error occurred during Google sign-in.");
        }
    }
}
