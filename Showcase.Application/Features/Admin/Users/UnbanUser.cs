using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Admin.Users;

public record UnbanUserCommand(string UserId) : IRequest<Result>;

public class UnbanUserCommandValidator : AbstractValidator<UnbanUserCommand>
{
    public UnbanUserCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");
    }
}

public class UnbanUserCommandHandler : IRequestHandler<UnbanUserCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IAuditLogger _auditLogger;
    private readonly ICurrentUserService _currentUserService;

    public UnbanUserCommandHandler(
        IApplicationDbContext context,
        IAuditLogger auditLogger,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _auditLogger = auditLogger;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(UnbanUserCommand request, CancellationToken ct)
    {
        var profile = await _context.Profiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.UserId == request.UserId, ct);

        if (profile is null)
            return ProfileErrors.NotFoundForUser(request.UserId);

        profile.Unban();
        await _context.SaveChangesAsync(ct);

        await _auditLogger.LogAsync(
            _currentUserService.UserId ?? "admin-system",
            _currentUserService.Username ?? "admin",
            "USER_UNBANNED",
            "User",
            request.UserId,
            profile.Name,
            "Account reactivated by administrator",
            ct: ct);

        return Result.Success();
    }
}
