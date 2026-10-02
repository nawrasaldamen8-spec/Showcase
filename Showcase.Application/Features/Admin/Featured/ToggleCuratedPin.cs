using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Enums;

namespace Showcase.Application.Features.Admin.Featured;

public record ToggleCuratedPinCommand(
    Guid Id,
    bool IsPinned) : IRequest<Result>;

public class ToggleCuratedPinCommandHandler : IRequestHandler<ToggleCuratedPinCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IPublisher _publisher;
    private readonly IAuditLogger _auditLogger;
    private readonly ICurrentUserService _currentUserService;

    public ToggleCuratedPinCommandHandler(
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

    public async Task<Result> Handle(ToggleCuratedPinCommand request, CancellationToken ct)
    {
        var featuredReq = await _context.FeaturedRequests
            .FirstOrDefaultAsync(f => f.Id == request.Id, ct);

        if (featuredReq is null)
            return Error.NotFound("FeaturedRequest.NotFound", $"Featured request '{request.Id}' was not found.");

        var profile = await _context.Profiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.UserId == featuredReq.UserId, ct);

        if (profile is not null)
        {
            var nextStatus = request.IsPinned ? FeaturedStatus.Featured : FeaturedStatus.None;
            profile.SetFeaturedStatus(nextStatus);

            if (request.IsPinned)
            {
                await _publisher.Publish(new Showcase.Application.Features.Notifications.Events.FeaturedApprovedNotificationEvent(
                    featuredReq.UserId,
                    "Your profile has been spotlighted in the Curated Discover Feed!"), ct);
            }
        }

        await _context.SaveChangesAsync(ct);

        await _auditLogger.LogAsync(
            _currentUserService.UserId ?? "admin-system",
            _currentUserService.Username ?? "admin",
            "FEATURED_PIN_TOGGLED",
            "FeaturedRequest",
            request.Id.ToString(),
            profile?.Name ?? featuredReq.UserId,
            request.IsPinned ? "Pinned to curated feed" : "Unpinned from curated feed",
            ct: ct);

        return Result.Success();
    }
}
