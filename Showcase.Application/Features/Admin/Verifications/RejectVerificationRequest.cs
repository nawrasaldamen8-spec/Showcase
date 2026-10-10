namespace Showcase.Application.Features.Admin.Verifications;

public record RejectVerificationRequestCommand(
    Guid RequestId,
    string? Note = null) : IRequest<Result>;

public class RejectVerificationRequestCommandHandler(
    IApplicationDbContext context,
    IPublisher publisher,
    IAuditLogger auditLogger) : IRequestHandler<RejectVerificationRequestCommand, Result>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IPublisher _publisher = publisher;
    private readonly IAuditLogger _auditLogger = auditLogger;

    public async Task<Result> Handle(RejectVerificationRequestCommand request, CancellationToken ct)
    {
        var verificationReq = await _context.VerificationRequests
            .FirstOrDefaultAsync(v => v.Id == request.RequestId, ct);

        if (verificationReq is null)
            return Error.NotFound("VerificationRequest.NotFound", $"Verification request '{request.RequestId}' was not found.");

        var rejectResult = verificationReq.Reject(request.Note);
        if (rejectResult.IsFailure)
            return rejectResult;

        var profile = await _context.Profiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.UserId == verificationReq.UserId, ct);

        if (profile is not null)
        {
            profile.RejectVerification();
        }

        await _context.SaveChangesAsync(ct);

        await _publisher.Publish(new Showcase.Application.Features.Notifications.Events.VerificationRejectedNotificationEvent(
            verificationReq.UserId,
            request.Note), ct);

        await _auditLogger.LogAsync(
            "VERIFICATION_REJECTED",
            "VerificationRequest",
            request.RequestId.ToString(),
            profile?.Name ?? verificationReq.UserId,
            !string.IsNullOrWhiteSpace(request.Note) ? request.Note.Trim() : "Verification request rejected",
            ct: ct);

        return Result.Success();
    }
}
