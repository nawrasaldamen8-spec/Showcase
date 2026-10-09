using Showcase.Application.Features.Notifications.Events;

namespace Showcase.Application.Features.Admin.Users;

public record ToggleUserFeaturedCommand(
    string UserId,
    bool IsFeatured,
    string? Note = null) : IRequest<Result>;

public class ToggleUserFeaturedCommandValidator : AbstractValidator<ToggleUserFeaturedCommand>
{
    public ToggleUserFeaturedCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");
    }
}

public class ToggleUserFeaturedCommandHandler(
    IApplicationDbContext context,
    IPublisher publisher,
    IAuditLogger auditLogger) : IRequestHandler<ToggleUserFeaturedCommand, Result>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IPublisher _publisher = publisher;
    private readonly IAuditLogger _auditLogger = auditLogger;

    public async Task<Result> Handle(ToggleUserFeaturedCommand request, CancellationToken ct)
    {
        var profile = await _context.Profiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.UserId == request.UserId, ct);

        if (profile is null)
        {
            return ProfileErrors.NotFoundForUser(request.UserId);
        }

        var nextStatus = request.IsFeatured ? FeaturedStatus.Featured : FeaturedStatus.None;
        var transitionResult = profile.SetFeaturedStatus(nextStatus);
        if (transitionResult.IsFailure)
        {
            return transitionResult;
        }

        // Sync or create the corresponding FeaturedRequest record
        var featuredReq = await _context.FeaturedRequests
            .OrderByDescending(f => f.CreatedAtUtc)
            .FirstOrDefaultAsync(f => f.UserId == request.UserId, ct);

        if (featuredReq is not null)
        {
            featuredReq.SetStatus(nextStatus, request.Note);
        }
        else if (request.IsFeatured)
        {
            var newReq = new FeaturedRequest(request.UserId, "Directly curated by administrator.");
            newReq.SetStatus(FeaturedStatus.Featured, request.Note);
            _context.FeaturedRequests.Add(newReq);
        }

        await _context.SaveChangesAsync(ct);

        if (request.IsFeatured)
        {
            await _publisher.Publish(new FeaturedApprovedNotificationEvent(
                request.UserId,
                request.Note ?? "Your profile has been spotlighted in the Curated Discover Feed!"), ct);
        }

        await _auditLogger.LogAsync(
            request.IsFeatured ? "FEATURED_GRANTED" : "FEATURED_REVOKED",
            "User",
            request.UserId,
            profile.Name,
            request.Note ?? (request.IsFeatured ? "Profile featured in discovery feed" : "Profile unfeatured from discovery feed"),
            ct: ct);

        return Result.Success();
    }
}
