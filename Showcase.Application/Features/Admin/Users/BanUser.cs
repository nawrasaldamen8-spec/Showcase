using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Admin.Users;

public record BanUserCommand(
    string UserId,
    string Reason) : IRequest<Result>;

public class BanUserCommandValidator : AbstractValidator<BanUserCommand>
{
    public BanUserCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Ban reason is required.")
            .MaximumLength(500).WithMessage("Ban reason must not exceed 500 characters.");
    }
}

public class BanUserCommandHandler : IRequestHandler<BanUserCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IAuditLogger _auditLogger;
    private readonly ICurrentUserService _currentUserService;

    public BanUserCommandHandler(
        IApplicationDbContext context,
        IAuditLogger auditLogger,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _auditLogger = auditLogger;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(BanUserCommand request, CancellationToken ct)
    {
        var profile = await _context.Profiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.UserId == request.UserId, ct);

        if (profile is null)
            return ProfileErrors.NotFoundForUser(request.UserId);

        profile.Ban(request.Reason);
        await _context.SaveChangesAsync(ct);

        await _auditLogger.LogAsync(
            _currentUserService.UserId ?? "admin-system",
            _currentUserService.Username ?? "admin",
            "USER_BANNED",
            "User",
            request.UserId,
            profile.Name,
            request.Reason,
            ct: ct);

        return Result.Success();
    }
}
