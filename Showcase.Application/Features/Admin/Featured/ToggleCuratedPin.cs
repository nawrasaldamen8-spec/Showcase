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

    public ToggleCuratedPinCommandHandler(
        IApplicationDbContext context,
        IPublisher publisher)
    {
        _context = context;
        _publisher = publisher;
    }

    public async Task<Result> Handle(ToggleCuratedPinCommand request, CancellationToken ct)
    {
        var featuredReq = await _context.FeaturedRequests
            .FirstOrDefaultAsync(f => f.Id == request.Id, ct);

        if (featuredReq is null)
            return Error.NotFound("FeaturedRequest.NotFound", $"Featured request '{request.Id}' was not found.");

        var profile = await _context.Profiles
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
        return Result.Success();
    }
}
