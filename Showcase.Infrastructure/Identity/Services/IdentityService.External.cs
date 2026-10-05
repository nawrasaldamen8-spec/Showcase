using Microsoft.AspNetCore.Identity;

namespace Showcase.Infrastructure.Identity;

public partial class IdentityService
{
    public async Task<Result<UserIdentityDetails?>> GetExistingExternalUserAsync(
        string provider,
        string providerKey,
        string email,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(provider) || string.IsNullOrWhiteSpace(providerKey))
        {
            return Error.Validation("Auth.InvalidExternalLogin", "Provider and ProviderKey are required.");
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            return Error.Validation("Auth.EmailRequired", "Email is required for external authentication.");
        }

        var normalizedEmail = email.Trim().ToLowerInvariant();

        // 1. Try finding user by external login
        var user = await _userManager.FindByLoginAsync(provider, providerKey);

        // 2. If not found by login, try finding by email
        if (user is null)
        {
            user = await _userManager.FindByEmailAsync(normalizedEmail);
            if (user is not null)
            {
                // Link external login provider to existing user
                await _userManager.AddLoginAsync(user, new UserLoginInfo(provider, providerKey, provider));
            }
        }

        if (user is null)
        {
            return Result.Success<UserIdentityDetails?>(null);
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
        return Result.Success<UserIdentityDetails?>(ToDetails(user, roles));
    }

    public async Task<Result<UserIdentityDetails>> RegisterExternalUserAsync(
        string provider,
        string providerKey,
        string email,
        string username,
        string name,
        string? specialty = null,
        string? bio = null,
        string? pictureUrl = null,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(provider) || string.IsNullOrWhiteSpace(providerKey))
        {
            return Error.Validation("Auth.InvalidExternalLogin", "Provider and ProviderKey are required.");
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            return Error.Validation("Auth.EmailRequired", "Email is required for external authentication.");
        }

        var normalizedEmail = email.Trim().ToLowerInvariant();
        var normalizedUsername = username.Trim().ToLowerInvariant();

        // Check if username already exists
        if (await _userManager.FindByNameAsync(normalizedUsername) is not null)
        {
            return Error.Conflict("Auth.UsernameTaken", "Username is already in use.");
        }

        // Check if email already exists
        if (await _userManager.FindByEmailAsync(normalizedEmail) is not null)
        {
            return Error.Conflict("Auth.EmailTaken", "An account with this email address already exists.");
        }

        // Check if provider login already exists
        if (await _userManager.FindByLoginAsync(provider, providerKey) is not null)
        {
            return Error.Conflict("Auth.ProviderLoginExists", "This social login is already linked to an existing account.");
        }

        var user = new ApplicationUser
        {
            UserName = normalizedUsername,
            Email = normalizedEmail,
            EmailConfirmed = true
        };

        await using var transaction = await _context.BeginTransactionAsync(ct);

        var createResult = await _userManager.CreateAsync(user);
        if (!createResult.Succeeded)
        {
            var firstError = createResult.Errors.FirstOrDefault()?.Description ?? "Failed to create external user.";
            return Error.Validation("Auth.RegistrationFailed", firstError);
        }

        var roleResult = await _userManager.AddToRoleAsync(user, "Member");
        if (!roleResult.Succeeded)
        {
            var firstError = roleResult.Errors.FirstOrDefault()?.Description ?? "Failed to assign role to external user.";
            return Error.Validation("Auth.RegistrationFailed", firstError);
        }

        var loginResult = await _userManager.AddLoginAsync(user, new UserLoginInfo(provider, providerKey, provider));
        if (!loginResult.Succeeded)
        {
            var firstError = loginResult.Errors.FirstOrDefault()?.Description ?? "Failed to link login to external user.";
            return Error.Validation("Auth.RegistrationFailed", firstError);
        }

        // Create Profile
        var displayName = string.IsNullOrWhiteSpace(name) ? normalizedUsername : name.Trim();
        var avatarKeyResult = StorageKey.CreateOptional(pictureUrl);
        var bioResult = Bio.CreateOptional(bio);
        var profile = new Profile(
            user.Id,
            displayName,
            specialty: specialty?.Trim(),
            bio: bioResult.IsSuccess ? bioResult.Value : null,
            avatarKey: avatarKeyResult.IsSuccess ? avatarKeyResult.Value : null);

        _context.Set<Profile>().Add(profile);
        await _context.SaveChangesAsync(ct);

        await transaction.CommitAsync(ct);

        var roles = await _userManager.GetRolesAsync(user);
        return ToDetails(user, roles);
    }

    public async Task<Result<(UserIdentityDetails User, bool IsNewUser)>> GetOrCreateExternalUserAsync(
        string provider,
        string providerKey,
        string email,
        string name,
        string? pictureUrl = null,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(provider) || string.IsNullOrWhiteSpace(providerKey))
        {
            return Error.Validation("Auth.InvalidExternalLogin", "Provider and ProviderKey are required.");
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            return Error.Validation("Auth.EmailRequired", "Email is required for external authentication.");
        }

        var normalizedEmail = email.Trim().ToLowerInvariant();
        var isNewUser = false;

        // 1. Try finding user by external login
        var user = await _userManager.FindByLoginAsync(provider, providerKey);

        // 2. If not found by login, try finding by email
        if (user is null)
        {
            user = await _userManager.FindByEmailAsync(normalizedEmail);
            if (user is not null)
            {
                // Link external login provider to existing user
                await _userManager.AddLoginAsync(user, new UserLoginInfo(provider, providerKey, provider));
            }
        }

        // 3. If still not found, create new user, role, login, and profile
        if (user is null)
        {
            isNewUser = true;
            var baseUsername = normalizedEmail.Split('@')[0];
            baseUsername = Regex.Replace(baseUsername, @"[^a-z0-9_]", "_");
            if (string.IsNullOrWhiteSpace(baseUsername))
            {
                baseUsername = "user";
            }

            var username = baseUsername;
            var suffix = 1;
            while (await _userManager.FindByNameAsync(username) is not null)
            {
                username = $"{baseUsername}{suffix++}";
            }

            user = new ApplicationUser
            {
                UserName = username,
                Email = normalizedEmail,
                EmailConfirmed = true
            };

            await using var transaction = await _context.BeginTransactionAsync(ct);

            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                var firstError = createResult.Errors.FirstOrDefault()?.Description ?? "Failed to create external user.";
                return Error.Validation("Auth.RegistrationFailed", firstError);
            }

            var roleResult = await _userManager.AddToRoleAsync(user, "Member");
            if (!roleResult.Succeeded)
            {
                var firstError = roleResult.Errors.FirstOrDefault()?.Description ?? "Failed to assign role to external user.";
                return Error.Validation("Auth.RegistrationFailed", firstError);
            }

            var loginResult = await _userManager.AddLoginAsync(user, new UserLoginInfo(provider, providerKey, provider));
            if (!loginResult.Succeeded)
            {
                var firstError = loginResult.Errors.FirstOrDefault()?.Description ?? "Failed to link login to external user.";
                return Error.Validation("Auth.RegistrationFailed", firstError);
            }

            // Create Profile
            var displayName = string.IsNullOrWhiteSpace(name) ? username : name.Trim();
            var avatarKeyResult = StorageKey.CreateOptional(pictureUrl);
            var profile = new Profile(user.Id, displayName, avatarKey: avatarKeyResult.IsSuccess ? avatarKeyResult.Value : null);
            _context.Set<Profile>().Add(profile);
            await _context.SaveChangesAsync(ct);

            await transaction.CommitAsync(ct);
        }

        // 4. Verify account is not suspended or deleted
        if (user.IsBanned)
        {
            return Error.Forbidden("Auth.AccountBanned", user.BanReason ?? "This account has been suspended.");
        }

        if (user.IsDeleted)
        {
            return Error.Forbidden("Auth.AccountDeleted", "This account has been deleted.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        return (ToDetails(user, roles), isNewUser);
    }
}
