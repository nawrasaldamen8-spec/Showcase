namespace Showcase.Application.Features.Admin.Featured;

public record ApproveFeaturedRequestCommand(
    Guid Id,
    string? Note = null) : IRequest<Result>;

public class ApproveFeaturedRequestCommandHandler(
    IApplicationDbContext context,
    IPublisher publisher,
    IAuditLogger auditLogger) : IRequestHandler<ApproveFeaturedRequestCommand, Result>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IPublisher _publisher = publisher;
    private readonly IAuditLogger _auditLogger = auditLogger;

    public async Task<Result> Handle(ApproveFeaturedRequestCommand request, CancellationToken ct)
    {
        var featuredReq = await _context.FeaturedRequests
            .FirstOrDefaultAsync(f => f.Id == request.Id, ct);

        if (featuredReq is null)
            return Error.NotFound("FeaturedRequest.NotFound", $"Featured request '{request.Id}' was not found.");

        var approveResult = featuredReq.Approve(request.Note);
        if (approveResult.IsFailure)
            return approveResult;

        var profile = await _context.Profiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.UserId == featuredReq.UserId, ct);

        if (profile is not null)
        {
            profile.SetFeaturedStatus(FeaturedStatus.Featured);
        }

        await _context.SaveChangesAsync(ct);

        await _publisher.Publish(new Showcase.Application.Features.Notifications.Events.FeaturedApprovedNotificationEvent(
            featuredReq.UserId,
            request.Note), ct);

        await _auditLogger.LogAsync(
            "FEATURED_APPROVED",
            "FeaturedRequest",
            request.Id.ToString(),
            profile?.Name ?? featuredReq.UserId,
            !string.IsNullOrWhiteSpace(request.Note) ? request.Note.Trim() : "Featured spotlight recommendation approved",
            ct: ct);

        return Result.Success();
    }
}
