namespace Showcase.Application.Features.Admin.Verifications;

public record ApproveVerificationRequestCommand(
    Guid RequestId,
    string? Note = null) : IRequest<Result>;

public class ApproveVerificationRequestCommandHandler(
    IApplicationDbContext context,
    IPublisher publisher,
    IAuditLogger auditLogger) : IRequestHandler<ApproveVerificationRequestCommand, Result>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IPublisher _publisher = publisher;
    private readonly IAuditLogger _auditLogger = auditLogger;

    public async Task<Result> Handle(ApproveVerificationRequestCommand request, CancellationToken ct)
    {
        var verificationReq = await _context.VerificationRequests
            .FirstOrDefaultAsync(v => v.Id == request.RequestId, ct);

        if (verificationReq is null)
            return Error.NotFound("VerificationRequest.NotFound", $"Verification request '{request.RequestId}' was not found.");

        var approveResult = verificationReq.Approve(request.Note);
        if (approveResult.IsFailure)
            return approveResult;

        var profile = await _context.Profiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.UserId == verificationReq.UserId, ct);

        if (profile is not null)
        {
            profile.MarkVerified(true);
        }

        await _context.SaveChangesAsync(ct);

        await _publisher.Publish(new Showcase.Application.Features.Notifications.Events.VerificationApprovedNotificationEvent(
            verificationReq.UserId,
            request.Note), ct);

        await _auditLogger.LogAsync(
            "VERIFICATION_APPROVED",
            "VerificationRequest",
            request.RequestId.ToString(),
            profile?.Name ?? verificationReq.UserId,
            !string.IsNullOrWhiteSpace(request.Note) ? request.Note.Trim() : "Verification badge granted",
            ct: ct);

        return Result.Success();
    }
}
