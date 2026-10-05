namespace Showcase.Application.Features.Auth.Commands;



public record GoogleCallbackResponse(string RedirectUrl);

public record HandleGoogleCallbackCommand(
    string? Code = null,
    string? Error = null,
    string? State = null) : IRequest<Result<GoogleCallbackResponse>>;



public class HandleGoogleCallbackCommandHandler(
    IGoogleAuthService googleAuthService,
    IOptions<GoogleAuthSettings> googleOptions,
    IIdentityService identityService,
    ITokenService tokenService,
    ILogger<HandleGoogleCallbackCommandHandler> logger,
    IAuthCookieService? authCookieService = null) : IRequestHandler<HandleGoogleCallbackCommand, Result<GoogleCallbackResponse>>
{
    private readonly IGoogleAuthService _googleAuthService = googleAuthService;
    private readonly IOptions<GoogleAuthSettings> _googleOptions = googleOptions;
    private readonly IIdentityService _identityService = identityService;
    private readonly ITokenService _tokenService = tokenService;
    private readonly IAuthCookieService? _authCookieService = authCookieService;
    private readonly ILogger<HandleGoogleCallbackCommandHandler> _logger = logger;

    public async Task<Result<GoogleCallbackResponse>> Handle(HandleGoogleCallbackCommand request, CancellationToken ct)
    {
        var frontendBase = ResolveFrontendBaseUrl(_googleOptions.Value.FrontendRedirectUrl);
        var fallbackLoginUrl = $"{frontendBase}/login";

        if (!string.IsNullOrWhiteSpace(request.Error) || string.IsNullOrWhiteSpace(request.Code))
        {
            _logger.LogWarning("Google OAuth returned error or missing code: {Error}", request.Error);
            return new GoogleCallbackResponse(BuildErrorRedirect(fallbackLoginUrl, request.Error ?? "Google authorization was cancelled."));
        }

        var userInfoResult = await _googleAuthService.ExchangeCodeForUserInfoAsync(request.Code, ct);
        if (userInfoResult.IsFailure)
        {
            return new GoogleCallbackResponse(BuildErrorRedirect(fallbackLoginUrl, userInfoResult.Error.Description));
        }

        var userInfo = userInfoResult.Value;
        var existingUserResult = await _identityService.GetExistingExternalUserAsync("Google", userInfo.Sub, userInfo.Email, ct);
        if (existingUserResult.IsFailure)
        {
            _logger.LogWarning("External user lookup failed: {Error}", existingUserResult.Error.Description);
            return new GoogleCallbackResponse(BuildErrorRedirect(fallbackLoginUrl, existingUserResult.Error.Description));
        }

        var existingUser = existingUserResult.Value;
        if (existingUser is not null)
        {
            var jwtToken = _tokenService.GenerateAccessToken(existingUser.Id, existingUser.UserName, existingUser.Email, existingUser.Roles);
            var refreshToken = _tokenService.GenerateRefreshToken();
            await _identityService.UpdateRefreshTokenAsync(existingUser.Id, refreshToken, DateTime.UtcNow.AddDays(7), ct);

            _authCookieService?.SetAuthCookies(jwtToken, refreshToken);

            var targetState = NormalizeTargetState(request.State);
            return new GoogleCallbackResponse($"{frontendBase}{targetState}");
        }

        var onboardingToken = _tokenService.GenerateOnboardingToken("Google", userInfo.Sub, userInfo.Email, userInfo.Name, userInfo.Picture);
        var onboardingUrl = $"{frontendBase}/register?oauth=google&token={UrlEncoder.Default.Encode(onboardingToken)}";
        return new GoogleCallbackResponse(onboardingUrl);
    }

    private static string ResolveFrontendBaseUrl(string configuredUrl) =>
        configuredUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase)
            ? new Uri(configuredUrl).GetLeftPart(UriPartial.Authority)
            : "http://localhost:5173";

    private static string BuildErrorRedirect(string baseUrl, string errorMessage) =>
        $"{baseUrl}?error={UrlEncoder.Default.Encode(errorMessage)}";

    private static string NormalizeTargetState(string? state)
    {
        var targetState = !string.IsNullOrWhiteSpace(state) ? Uri.UnescapeDataString(state) : "/feed";
        return targetState.StartsWith("/") ? targetState : "/feed";
    }
}

