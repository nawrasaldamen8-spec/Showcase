namespace Showcase.Infrastructure.Identity;

public partial class IdentityService
{
    public async Task<Result<UserIdentityDetails>> AuthenticateAsync(
        string emailOrUsername,
        string password,
        CancellationToken ct = default)
    {
        var normalizedInput = emailOrUsername.Trim();

        // Email is optional, so a null Email column is the norm for many accounts. Guarding on the '@' keeps
        // FindByEmailAsync from matching an arbitrary account whose Email is null.
        var user = LooksLikeEmail(normalizedInput)
            ? await _userManager.FindByEmailAsync(normalizedInput)
            : null;

        user ??= await _userManager.FindByNameAsync(normalizedInput.ToLowerInvariant());

        if (user is null)
        {
            return Error.Unauthorized("Auth.InvalidCredentials", "Invalid credentials.");
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, password);
        if (!isPasswordValid)
        {
            return Error.Unauthorized("Auth.InvalidCredentials", "Invalid credentials.");
        }

        if (user.IsBanned)
        {
            return Error.Forbidden("Auth.AccountBanned", user.BanReason ?? "This account has been suspended.");
        }

        if (user.IsDeleted)
        {
            return Error.Forbidden("Auth.AccountDeleted", "This account has been deleted.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        return ToDetails(user, roles);
    }

    public async Task<Result<UserIdentityDetails>> ValidateRefreshTokenAsync(
        string userId,
        string refreshToken,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(refreshToken))
        {
            return Error.Unauthorized("Auth.InvalidRefreshToken", "Invalid or expired refresh token.");
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return Error.Unauthorized("Auth.InvalidRefreshToken", "Invalid or expired refresh token.");
        }

        var isCurrentValid = !string.IsNullOrWhiteSpace(user.RefreshToken)
            && user.RefreshToken == refreshToken
            && user.RefreshTokenExpiryTime.HasValue
            && user.RefreshTokenExpiryTime.Value > DateTime.UtcNow;

        var isGracePeriodValid = !string.IsNullOrWhiteSpace(user.PreviousRefreshToken)
            && user.PreviousRefreshToken == refreshToken
            && user.PreviousRefreshTokenExpiryTime.HasValue
            && user.PreviousRefreshTokenExpiryTime.Value > DateTime.UtcNow;

        if (!isCurrentValid && !isGracePeriodValid)
        {
            return Error.Unauthorized("Auth.InvalidRefreshToken", "Invalid or expired refresh token.");
        }

        if (user.IsBanned)
        {
            return Error.Forbidden("Auth.AccountBanned", user.BanReason ?? "This account has been suspended.");
        }

        if (user.IsDeleted)
        {
            return Error.Forbidden("Auth.AccountDeleted", "This account has been deleted.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        return ToDetails(user, roles);
    }

    public async Task<Result<UserIdentityDetails>> ValidateRefreshTokenDirectAsync(
        string refreshToken,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return Error.Unauthorized("Auth.InvalidRefreshToken", "Refresh token is missing.");
        }

        var user = await _userManager.Users
            .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken || u.PreviousRefreshToken == refreshToken, ct);

        if (user is null)
        {
            return Error.Unauthorized("Auth.InvalidRefreshToken", "Invalid or expired refresh token.");
        }

        var isCurrentValid = !string.IsNullOrWhiteSpace(user.RefreshToken)
            && user.RefreshToken == refreshToken
            && user.RefreshTokenExpiryTime.HasValue
            && user.RefreshTokenExpiryTime.Value > DateTime.UtcNow;

        var isGracePeriodValid = !string.IsNullOrWhiteSpace(user.PreviousRefreshToken)
            && user.PreviousRefreshToken == refreshToken
            && user.PreviousRefreshTokenExpiryTime.HasValue
            && user.PreviousRefreshTokenExpiryTime.Value > DateTime.UtcNow;

        if (!isCurrentValid && !isGracePeriodValid)
        {
            return Error.Unauthorized("Auth.InvalidRefreshToken", "Invalid or expired refresh token.");
        }

        if (user.IsBanned)
        {
            return Error.Forbidden("Auth.AccountBanned", user.BanReason ?? "This account has been suspended.");
        }

        if (user.IsDeleted)
        {
            return Error.Forbidden("Auth.AccountDeleted", "This account has been deleted.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        return ToDetails(user, roles);
    }

    public async Task<Result> UpdateRefreshTokenAsync(
        string userId,
        string refreshToken,
        DateTime expiryTime,
        CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return Error.NotFound("Auth.UserNotFound", $"User with ID '{userId}' was not found.");
        }

        // Store previous token with a 45-second grace window to handle concurrent requests / tabs / HMR
        if (!string.IsNullOrWhiteSpace(user.RefreshToken) && user.RefreshToken != refreshToken)
        {
            user.PreviousRefreshToken = user.RefreshToken;
            user.PreviousRefreshTokenExpiryTime = DateTime.UtcNow.AddSeconds(45);
        }

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = expiryTime;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var firstError = result.Errors.FirstOrDefault()?.Description ?? "Failed to update refresh token.";
            return Error.Failure("Auth.UpdateTokenFailed", firstError);
        }

        return Result.Success();
    }

    public async Task<Result> RevokeRefreshTokenAsync(
        string userId,
        CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return Error.NotFound("Auth.UserNotFound", $"User with ID '{userId}' was not found.");
        }

        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = null;
        user.PreviousRefreshToken = null;
        user.PreviousRefreshTokenExpiryTime = null;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var firstError = result.Errors.FirstOrDefault()?.Description ?? "Failed to revoke refresh token.";
            return Error.Failure("Auth.RevokeTokenFailed", firstError);
        }

        return Result.Success();
    }
}
