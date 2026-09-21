using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Common.Interfaces;

public record UserIdentityDetails(
    string Id,
    string Email,
    string UserName,
    IList<string> Roles);

public interface IIdentityService
{
    Task<Result<string>> RegisterUserAsync(
        string email,
        string username,
        string password,
        CancellationToken ct = default);

    Task<Result<UserIdentityDetails>> AuthenticateAsync(
        string emailOrUsername,
        string password,
        CancellationToken ct = default);

    Task<Result<UserIdentityDetails>> ValidateRefreshTokenAsync(
        string userId,
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
}
