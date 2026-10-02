using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Admin.Verifications;

public record RejectVerificationRequestCommand(
    Guid RequestId,
    string? Note = null) : IRequest<Result>;

public class RejectVerificationRequestCommandHandler : IRequestHandler<RejectVerificationRequestCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IPublisher _publisher;
    private readonly IAuditLogger _auditLogger;
    private readonly ICurrentUserService _currentUserService;

    public RejectVerificationRequestCommandHandler(
        IApplicationDbContext context,
        IPublisher publisher,
        IAuditLogger auditLogger,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _publisher = publisher;
        _auditLogger = auditLogger;
        _currentUserService = currentUserService;
    }

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
            _currentUserService.UserId ?? "admin-system",
            _currentUserService.Username ?? "admin",
            "VERIFICATION_REJECTED",
            "VerificationRequest",
            request.RequestId.ToString(),
            profile?.Name ?? verificationReq.UserId,
            request.Note ?? "Verification request rejected",
            ct: ct);

        return Result.Success();
    }
}
