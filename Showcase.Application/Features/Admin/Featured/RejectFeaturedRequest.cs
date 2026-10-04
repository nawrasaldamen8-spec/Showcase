using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Enums;

namespace Showcase.Application.Features.Admin.Featured;

public record RejectFeaturedRequestCommand(
    Guid Id,
    string? Note = null) : IRequest<Result>;

public class RejectFeaturedRequestCommandHandler : IRequestHandler<RejectFeaturedRequestCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IPublisher _publisher;
    private readonly IAuditLogger _auditLogger;

    public RejectFeaturedRequestCommandHandler(
        IApplicationDbContext context,
        IPublisher publisher,
        IAuditLogger auditLogger)
    {
        _context = context;
        _publisher = publisher;
        _auditLogger = auditLogger;
    }

    public async Task<Result> Handle(RejectFeaturedRequestCommand request, CancellationToken ct)
    {
        var featuredReq = await _context.FeaturedRequests
            .FirstOrDefaultAsync(f => f.Id == request.Id, ct);

        if (featuredReq is null)
            return Error.NotFound("FeaturedRequest.NotFound", $"Featured request '{request.Id}' was not found.");

        var rejectResult = featuredReq.Reject(request.Note);
        if (rejectResult.IsFailure)
            return rejectResult;

        var profile = await _context.Profiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.UserId == featuredReq.UserId, ct);

        if (profile is not null)
        {
            profile.SetFeaturedStatus(FeaturedStatus.Rejected);
        }

        await _context.SaveChangesAsync(ct);

        await _publisher.Publish(new Showcase.Application.Features.Notifications.Events.FeaturedRejectedNotificationEvent(
            featuredReq.UserId,
            request.Note), ct);

        await _auditLogger.LogAsync(
            "FEATURED_REJECTED",
            "FeaturedRequest",
            request.Id.ToString(),
            profile?.Name ?? featuredReq.UserId,
            request.Note ?? "Creator featured recommendation rejected",
            ct: ct);

        return Result.Success();
    }
}
