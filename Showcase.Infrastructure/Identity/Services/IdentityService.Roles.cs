namespace Showcase.Infrastructure.Identity;

public partial class IdentityService
{
    public async Task<Result> UpdateUserRolesAsync(
        string userId,
        IEnumerable<string> roles,
        CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return Error.NotFound("Auth.UserNotFound", $"User with ID '{userId}' was not found.");
        }

        var currentRoles = await _userManager.GetRolesAsync(user);
        var requestedRoles = roles.Where(r => !string.IsNullOrWhiteSpace(r)).Select(r => r.Trim()).Distinct().ToList();

        var rolesToRemove = currentRoles.Except(requestedRoles, StringComparer.OrdinalIgnoreCase).ToList();
        var rolesToAdd = requestedRoles.Except(currentRoles, StringComparer.OrdinalIgnoreCase).ToList();

        if (rolesToRemove.Count == 0 && rolesToAdd.Count == 0)
        {
            return Result.Success();
        }

        await using var transaction = await _context.BeginTransactionAsync(ct);

        if (rolesToRemove.Count > 0)
        {
            var removeResult = await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
            if (!removeResult.Succeeded)
            {
                var firstError = removeResult.Errors.FirstOrDefault()?.Description ?? "Failed to remove old roles.";
                return Error.Validation("Auth.UpdateRolesFailed", firstError);
            }
        }

        if (rolesToAdd.Count > 0)
        {
            var addResult = await _userManager.AddToRolesAsync(user, rolesToAdd);
            if (!addResult.Succeeded)
            {
                var firstError = addResult.Errors.FirstOrDefault()?.Description ?? "Failed to add new roles.";
                return Error.Validation("Auth.UpdateRolesFailed", firstError);
            }
        }

        await transaction.CommitAsync(ct);

        return Result.Success();
    }
}
