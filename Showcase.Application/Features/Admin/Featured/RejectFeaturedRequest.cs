namespace Showcase.Application.Features.Admin.Featured;

public record RejectFeaturedRequestCommand(
    Guid Id,
    string? Note = null) : IRequest<Result>;

public class RejectFeaturedRequestCommandHandler(
    IApplicationDbContext context,
    IPublisher publisher,
    IAuditLogger auditLogger) : IRequestHandler<RejectFeaturedRequestCommand, Result>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IPublisher _publisher = publisher;
    private readonly IAuditLogger _auditLogger = auditLogger;

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
            !string.IsNullOrWhiteSpace(request.Note) ? request.Note.Trim() : "Featured spotlight recommendation rejected",
            ct: ct);

        return Result.Success();
    }
}
