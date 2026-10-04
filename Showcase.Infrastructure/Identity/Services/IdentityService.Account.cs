using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;

namespace Showcase.Infrastructure.Identity;

public partial class IdentityService
{
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

        if (!string.IsNullOrEmpty(user.PasswordHash) || !string.IsNullOrEmpty(currentPassword))
        {
            var isPasswordValid = await _userManager.CheckPasswordAsync(user, currentPassword);
            if (!isPasswordValid)
            {
                return Error.Unauthorized("Auth.InvalidPassword", "Current password is incorrect.");
            }
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

    public async Task<Result> UpdatePhoneNumberAsync(
        string userId,
        string phoneNumber,
        CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return Error.NotFound("Auth.UserNotFound", $"User with ID '{userId}' was not found.");
        }

        var result = await _userManager.SetPhoneNumberAsync(user, phoneNumber);
        if (!result.Succeeded)
        {
            var firstError = result.Errors.FirstOrDefault()?.Description ?? "Failed to update phone number.";
            return Error.Validation("Profile.UpdatePhoneFailed", firstError);
        }

        return Result.Success();
    }

    public async Task<Result> VerifyPasswordAsync(
        string userId,
        string password,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Validation("Auth.UserIdRequired", "User ID is required.");

        if (string.IsNullOrWhiteSpace(password))
            return Error.Validation("Auth.PasswordRequired", "Password is required for verification.");

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            return Error.NotFound("User.NotFound", "User was not found.");

        var isValid = await _userManager.CheckPasswordAsync(user, password);
        if (!isValid)
            return Error.Validation("Auth.InvalidPassword", "The password provided is incorrect.");

        return Result.Success();
    }

    public async Task<Result<IReadOnlyDictionary<string, UserIdentityDetails>>> GetUsersByIdsAsync(
        IEnumerable<string> userIds,
        CancellationToken ct = default)
    {
        var idList = userIds?.Where(id => !string.IsNullOrWhiteSpace(id)).Distinct().ToList() ?? new List<string>();
        if (idList.Count == 0)
        {
            return Result.Success<IReadOnlyDictionary<string, UserIdentityDetails>>(new Dictionary<string, UserIdentityDetails>());
        }

        var users = await _userManager.Users
            .Where(u => idList.Contains(u.Id))
            .ToListAsync(ct);

        var resultDict = new Dictionary<string, UserIdentityDetails>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            resultDict[user.Id] = ToDetails(user, roles);
        }

        return Result.Success<IReadOnlyDictionary<string, UserIdentityDetails>>(resultDict);
    }
}
