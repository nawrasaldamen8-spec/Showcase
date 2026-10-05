namespace Showcase.Application.Features.Admin.Users;

public record UpdateUserRoleCommand(
    string UserId,
    IReadOnlyList<string> Roles,
    string? AdminPassword = null) : IRequest<Result>;

public class UpdateUserRoleCommandValidator : AbstractValidator<UpdateUserRoleCommand>
{
    public UpdateUserRoleCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");

        RuleFor(x => x.Roles)
            .NotNull().WithMessage("Roles list cannot be null.");
    }
}

public class UpdateUserRoleCommandHandler(
    IIdentityService identityService,
    ICurrentUserService currentUserService,
    IAuditLogger auditLogger) : IRequestHandler<UpdateUserRoleCommand, Result>
{
    private readonly IIdentityService _identityService = identityService;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IAuditLogger _auditLogger = auditLogger;

    public async Task<Result> Handle(UpdateUserRoleCommand request, CancellationToken ct)
    {
        var targetUserResult = await _identityService.GetUserByIdAsync(request.UserId, ct);
        if (targetUserResult.IsFailure)
            return targetUserResult.Error;

        var targetUser = targetUserResult.Value;

        // 1. Validate security policy when modifying administrative privileges
        var privilegeCheck = await ValidateAdminPrivilegeChangeAsync(targetUser.Roles, request.Roles, request.AdminPassword, ct);
        if (privilegeCheck.IsFailure)
            return privilegeCheck;

        // 2. Perform role update
        var updateResult = await _identityService.UpdateUserRolesAsync(request.UserId, request.Roles, ct);
        if (updateResult.IsFailure)
            return updateResult;

        // 3. Record security audit log
        await _auditLogger.LogAsync(
            "ROLE_MODIFIED",
            "User",
            request.UserId,
            targetUser.UserName,
            $"Assigned roles: {string.Join(", ", request.Roles)}",
            ct: ct);

        return Result.Success();
    }

    private async Task<Result> ValidateAdminPrivilegeChangeAsync(
        IEnumerable<string> currentRoles,
        IEnumerable<string> newRoles,
        string? adminPassword,
        CancellationToken ct)
    {
        var currentlyHasAdmin = currentRoles.Contains(AppRoles.Admin, StringComparer.OrdinalIgnoreCase);
        var willHaveAdmin = newRoles.Contains(AppRoles.Admin, StringComparer.OrdinalIgnoreCase);

        if (currentlyHasAdmin == willHaveAdmin)
            return Result.Success();

        if (string.IsNullOrWhiteSpace(adminPassword))
            return AdminErrors.PasswordRequired;

        var currentAdminId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(currentAdminId))
            return Error.Unauthorized("Auth.Unauthorized", "You must be authenticated as an administrator.");

        var verifyResult = await _identityService.VerifyPasswordAsync(currentAdminId, adminPassword, ct);
        if (verifyResult.IsFailure)
            return AdminErrors.InvalidPassword;

        return Result.Success();
    }
}
