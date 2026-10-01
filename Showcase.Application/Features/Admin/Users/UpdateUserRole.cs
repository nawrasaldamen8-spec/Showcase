using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;

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

public class UpdateUserRoleCommandHandler : IRequestHandler<UpdateUserRoleCommand, Result>
{
    private readonly IIdentityService _identityService;
    private readonly ICurrentUserService _currentUserService;

    public UpdateUserRoleCommandHandler(
        IIdentityService identityService,
        ICurrentUserService currentUserService)
    {
        _identityService = identityService;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(UpdateUserRoleCommand request, CancellationToken ct)
    {
        var targetUserResult = await _identityService.GetUserByIdAsync(request.UserId, ct);
        if (targetUserResult.IsFailure)
            return targetUserResult.Error;

        var targetUser = targetUserResult.Value;
        var currentlyHasAdmin = targetUser.Roles.Contains("Admin", System.StringComparer.OrdinalIgnoreCase);
        var willHaveAdmin = request.Roles.Contains("Admin", System.StringComparer.OrdinalIgnoreCase);

        // If modifying Admin status (granting or revoking Admin role), require admin password confirmation
        if (currentlyHasAdmin != willHaveAdmin)
        {
            if (string.IsNullOrWhiteSpace(request.AdminPassword))
            {
                return Error.Validation("Admin.PasswordRequired", "Admin password confirmation is required to modify administrative privileges.");
            }

            var currentAdminId = _currentUserService.UserId;
            if (string.IsNullOrWhiteSpace(currentAdminId))
            {
                return Error.Unauthorized("Auth.Unauthorized", "You must be authenticated as an administrator.");
            }

            var verifyResult = await _identityService.VerifyPasswordAsync(currentAdminId, request.AdminPassword, ct);
            if (verifyResult.IsFailure)
            {
                return Error.Validation("Admin.InvalidPassword", "The administrator password provided is incorrect.");
            }
        }

        return await _identityService.UpdateUserRolesAsync(request.UserId, request.Roles, ct);
    }
}
