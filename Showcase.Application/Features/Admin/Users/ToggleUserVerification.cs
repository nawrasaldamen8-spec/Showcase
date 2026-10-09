using Showcase.Application.Features.Notifications.Events;

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

public class ToggleUserVerificationCommandHandler(
    IApplicationDbContext context,
    IPublisher publisher,
    IAuditLogger auditLogger) : IRequestHandler<ToggleUserVerificationCommand, Result>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IPublisher _publisher = publisher;
    private readonly IAuditLogger _auditLogger = auditLogger;

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

        // Sync or create the corresponding VerificationRequest record
        var verificationReq = await _context.VerificationRequests
            .OrderByDescending(v => v.CreatedAtUtc)
            .FirstOrDefaultAsync(v => v.UserId == request.UserId, ct);

        if (verificationReq is not null)
        {
            verificationReq.SetStatus(request.IsVerified ? VerificationStatus.Verified : VerificationStatus.None, request.Note);
        }
        else if (request.IsVerified)
        {
            var newReq = new VerificationRequest(request.UserId, "Directly verified by administrator.");
            newReq.SetStatus(VerificationStatus.Verified, request.Note);
            _context.VerificationRequests.Add(newReq);
        }

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
