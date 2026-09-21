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
        string email,
        string username,
        string password,
        CancellationToken ct = default)
    {
        var normalizedEmail = email.Trim();
        var normalizedUsername = username.Trim().ToLowerInvariant();

        var existingEmail = await _userManager.FindByEmailAsync(normalizedEmail);
        if (existingEmail is not null)
        {
            return Error.Conflict("Auth.EmailTaken", "Email is already registered.");
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

        var user = await _userManager.FindByEmailAsync(normalizedInput)
            ?? await _userManager.FindByNameAsync(normalizedInput.ToLowerInvariant());

        if (user is null)
        {
            return Error.Unauthorized("Auth.InvalidCredentials", "Invalid credentials.");
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, password);
        if (!isPasswordValid)
        {
            return Error.Unauthorized("Auth.InvalidCredentials", "Invalid credentials.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        return new UserIdentityDetails(user.Id, user.Email ?? string.Empty, user.UserName ?? string.Empty, roles);
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

        var roles = await _userManager.GetRolesAsync(user);
        return new UserIdentityDetails(user.Id, user.Email ?? string.Empty, user.UserName ?? string.Empty, roles);
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
        return new UserIdentityDetails(user.Id, user.Email ?? string.Empty, user.UserName ?? string.Empty, roles);
    }
}
