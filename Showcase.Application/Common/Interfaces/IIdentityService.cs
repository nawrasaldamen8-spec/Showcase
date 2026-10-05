namespace Showcase.Application.Common.Interfaces;

public record UserIdentityDetails(
    string Id,
    string? Email,
    string UserName,
    IList<string> Roles);

public interface IIdentityService
{
    Task<Result<string>> RegisterUserAsync(
        string username,
        string password,
        string? email = null,
        CancellationToken ct = default);

    Task<Result<UserIdentityDetails>> AuthenticateAsync(
        string emailOrUsername,
        string password,
        CancellationToken ct = default);

    Task<Result<UserIdentityDetails>> ValidateRefreshTokenAsync(
        string userId,
        string refreshToken,
        CancellationToken ct = default);

    Task<Result<UserIdentityDetails>> ValidateRefreshTokenDirectAsync(
        string refreshToken,
        CancellationToken ct = default);

    Task<Result> UpdateRefreshTokenAsync(
        string userId,
        string refreshToken,
        System.DateTime expiryTime,
        CancellationToken ct = default);

    Task<Result> RevokeRefreshTokenAsync(
        string userId,
        CancellationToken ct = default);

    Task<Result<UserIdentityDetails>> GetUserByIdAsync(
        string userId,
        CancellationToken ct = default);

    Task<Result<UserIdentityDetails>> GetUserByUsernameAsync(
        string username,
        CancellationToken ct = default);

    Task<Result> ChangePasswordAsync(
        string userId,
        string currentPassword,
        string newPassword,
        CancellationToken ct = default);

    Task<Result> ChangeEmailAsync(
        string userId,
        string newEmail,
        string currentPassword,
        CancellationToken ct = default);

    Task<Result> ChangeUsernameAsync(
        string userId,
        string newUsername,
        string currentPassword,
        CancellationToken ct = default);

    Task<Result> UpdatePhoneNumberAsync(
        string userId,
        string phoneNumber,
        CancellationToken ct = default);

    Task<Result> UpdateUserRolesAsync(
        string userId,
        IEnumerable<string> roles,
        CancellationToken ct = default);

    Task<Result> VerifyPasswordAsync(
        string userId,
        string password,
        CancellationToken ct = default);

    Task<Result<IReadOnlyDictionary<string, UserIdentityDetails>>> GetUsersByIdsAsync(
        IEnumerable<string> userIds,
        CancellationToken ct = default);

    Task<Result<UserIdentityDetails?>> GetExistingExternalUserAsync(
        string provider,
        string providerKey,
        string email,
        CancellationToken ct = default);

    Task<Result<UserIdentityDetails>> RegisterExternalUserAsync(
        string provider,
        string providerKey,
        string email,
        string username,
        string name,
        string? specialty = null,
        string? bio = null,
        string? pictureUrl = null,
        CancellationToken ct = default);

    Task<Result<(UserIdentityDetails User, bool IsNewUser)>> GetOrCreateExternalUserAsync(
        string provider,
        string providerKey,
        string email,
        string name,
        string? pictureUrl = null,
        CancellationToken ct = default);
}
