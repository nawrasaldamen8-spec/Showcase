using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Notifications.Events;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Admin.Users;

public record ToggleUserVerificationCommand(
    string UserId,
    bool IsVerified,
    string? Note = null) : IRequest<Result>;

public class ToggleUserVerificationCommandValidator : AbstractValidator<ToggleUserVerificationCommand>
{
    public ToggleUserVerificationCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");
    }
}

public class ToggleUserVerificationCommandHandler : IRequestHandler<ToggleUserVerificationCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IPublisher _publisher;
    private readonly IAuditLogger _auditLogger;

    public ToggleUserVerificationCommandHandler(
        IApplicationDbContext context,
        IPublisher publisher,
        IAuditLogger auditLogger)
    {
        _context = context;
        _publisher = publisher;
        _auditLogger = auditLogger;
    }

    public async Task<Result> Handle(ToggleUserVerificationCommand request, CancellationToken ct)
    {
        var profile = await _context.Profiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.UserId == request.UserId, ct);

        if (profile is null)
        {
            return ProfileErrors.NotFoundForUser(request.UserId);
        }

        profile.MarkVerified(request.IsVerified);
        await _context.SaveChangesAsync(ct);

        INotification notificationEvent = request.IsVerified
            ? new VerificationApprovedNotificationEvent(request.UserId, request.Note)
            : new VerificationRejectedNotificationEvent(request.UserId, request.Note);

        await _publisher.Publish(notificationEvent, ct);

        await _auditLogger.LogAsync(
            request.IsVerified ? "VERIFICATION_GRANTED" : "VERIFICATION_REVOKED",
            "User",
            request.UserId,
            profile.Name,
            request.Note ?? (request.IsVerified ? "Verified badge granted" : "Verified badge revoked"),
            ct: ct);

        return Result.Success();
    }
}
