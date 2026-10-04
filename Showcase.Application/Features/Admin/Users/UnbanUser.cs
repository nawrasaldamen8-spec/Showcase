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

    public UnbanUserCommandHandler(
        IApplicationDbContext context,
        IAuditLogger auditLogger)
    {
        _context = context;
        _auditLogger = auditLogger;
    }

    public async Task<Result> Handle(UnbanUserCommand request, CancellationToken ct)
    {
        await using var transaction = await _context.BeginTransactionAsync(ct);

        var profile = await _context.Profiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.UserId == request.UserId, ct);

        if (profile is null)
            return ProfileErrors.NotFoundForUser(request.UserId);

        profile.Unban();
        await _context.SaveChangesAsync(ct);

        await _auditLogger.LogAsync(
            "USER_UNBANNED",
            "User",
            request.UserId,
            profile.Name,
            "Account reactivated by administrator",
            ct: ct);

        await transaction.CommitAsync(ct);

        return Result.Success();
    }
}
