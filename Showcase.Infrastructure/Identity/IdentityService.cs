using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;

namespace Showcase.Infrastructure.Identity;

public class IdentityService : IIdentityService
{
    private readonly UserManager<ApplicationUser> _userManager;

    public IdentityService(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result<string>> RegisterUserAsync(
        string username,
        string password,
        string? email = null,
        CancellationToken ct = default)
    {
        var normalizedUsername = username.Trim().ToLowerInvariant();
        var normalizedEmail = string.IsNullOrWhiteSpace(email) ? null : email.Trim();

        if (normalizedEmail is not null)
        {
            var existingEmail = await _userManager.FindByEmailAsync(normalizedEmail);
            if (existingEmail is not null)
            {
                return Error.Conflict("Auth.EmailTaken", "Email is already registered.");
            }
        }

        var existingUsername = await _userManager.FindByNameAsync(normalizedUsername);
        if (existingUsername is not null)
        {
            return Error.Conflict("Auth.UsernameTaken", "Username is already in use.");
        }

        var user = new ApplicationUser
        {
            UserName = normalizedUsername,
            Email = normalizedEmail
        };

        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            var firstError = result.Errors.FirstOrDefault()?.Description ?? "Failed to create user account.";
            return Error.Validation("Auth.RegistrationFailed", firstError);
        }

        return user.Id;
    }

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
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return Error.Unauthorized("Auth.InvalidRefreshToken", "Invalid or expired refresh token.");
        }

        if (string.IsNullOrWhiteSpace(user.RefreshToken) ||
            user.RefreshToken != refreshToken ||
            !user.RefreshTokenExpiryTime.HasValue ||
            user.RefreshTokenExpiryTime.Value <= DateTime.UtcNow)
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

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var firstError = result.Errors.FirstOrDefault()?.Description ?? "Failed to revoke refresh token.";
            return Error.Failure("Auth.RevokeTokenFailed", firstError);
        }

        return Result.Success();
    }

    public async Task<Result<UserIdentityDetails>> GetUserByIdAsync(
        string userId,
        CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return Error.NotFound("Auth.UserNotFound", $"User with ID '{userId}' was not found.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        return ToDetails(user, roles);
    }

    public async Task<Result<UserIdentityDetails>> GetUserByUsernameAsync(
        string username,
        CancellationToken ct = default)
    {
        var normalizedUsername = username.Trim().ToLowerInvariant();
        var user = await _userManager.FindByNameAsync(normalizedUsername);
        if (user is null)
        {
            return Error.NotFound("Auth.UserNotFound", $"User with username '{username}' was not found.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        return ToDetails(user, roles);
    }

    public async Task<Result> ChangePasswordAsync(
        string userId,
        string currentPassword,
        string newPassword,
        CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return Error.NotFound("Auth.UserNotFound", $"User with ID '{userId}' was not found.");
        }

        var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        if (!result.Succeeded)
        {
            var firstError = result.Errors.FirstOrDefault()?.Description ?? "Failed to change password.";
            return Error.Validation("Auth.ChangePasswordFailed", firstError);
        }

        return Result.Success();
    }

    public async Task<Result> ChangeEmailAsync(
        string userId,
        string newEmail,
        string currentPassword,
        CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return Error.NotFound("Auth.UserNotFound", $"User with ID '{userId}' was not found.");
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, currentPassword);
        if (!isPasswordValid)
        {
            return Error.Unauthorized("Auth.InvalidPassword", "Current password is incorrect.");
        }

        var normalizedEmail = newEmail.Trim();
        if (string.Equals(user.Email, normalizedEmail, StringComparison.OrdinalIgnoreCase))
        {
            return Result.Success();
        }

        var existingUser = await _userManager.FindByEmailAsync(normalizedEmail);
        if (existingUser is not null && existingUser.Id != userId)
        {
            return Error.Conflict("Auth.EmailTaken", "Email is already registered.");
        }

        var token = await _userManager.GenerateChangeEmailTokenAsync(user, normalizedEmail);
        var result = await _userManager.ChangeEmailAsync(user, normalizedEmail, token);
        if (!result.Succeeded)
        {
            var firstError = result.Errors.FirstOrDefault()?.Description ?? "Failed to change email.";
            return Error.Validation("Auth.ChangeEmailFailed", firstError);
        }

        return Result.Success();
    }

    public async Task<Result> ChangeUsernameAsync(
        string userId,
        string newUsername,
        string currentPassword,
        CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return Error.NotFound("Auth.UserNotFound", $"User with ID '{userId}' was not found.");
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, currentPassword);
        if (!isPasswordValid)
        {
            return Error.Unauthorized("Auth.InvalidPassword", "Current password is incorrect.");
        }

        var normalizedUsername = newUsername.Trim().ToLowerInvariant();
        if (string.Equals(user.UserName, normalizedUsername, StringComparison.OrdinalIgnoreCase))
        {
            return Result.Success();
        }

        var existingUser = await _userManager.FindByNameAsync(normalizedUsername);
        if (existingUser is not null && existingUser.Id != userId)
        {
            return Error.Conflict("Auth.UsernameTaken", "Username is already in use.");
        }

        var result = await _userManager.SetUserNameAsync(user, normalizedUsername);
        if (!result.Succeeded)
        {
            var firstError = result.Errors.FirstOrDefault()?.Description ?? "Failed to change username.";
            return Error.Validation("Auth.ChangeUsernameFailed", firstError);
        }

        return Result.Success();
    }

    /// <summary>Keeps the null email intact instead of coercing it to an empty string, which lost the distinction.</summary>
    private static UserIdentityDetails ToDetails(ApplicationUser user, IList<string> roles) =>
        new(user.Id, user.Email, user.UserName ?? string.Empty, roles);

    private static bool LooksLikeEmail(string value) =>
        value.Contains('@', StringComparison.Ordinal) && value.Contains('.', StringComparison.Ordinal);
}
