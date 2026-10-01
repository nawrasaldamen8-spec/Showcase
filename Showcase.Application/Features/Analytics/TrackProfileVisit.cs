using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Analytics;

public record TrackProfileVisitCommand(
    Guid ProfileId,
    string HashedIp,
    string? VisitorToken = null) : IRequest<Result>;

public class TrackProfileVisitCommandHandler : IRequestHandler<TrackProfileVisitCommand, Result>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;
    private readonly IRealtimeNotifier _realtimeNotifier;

    public TrackProfileVisitCommandHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context,
        IRealtimeNotifier realtimeNotifier)
    {
        _currentUserService = currentUserService;
        _context = context;
        _realtimeNotifier = realtimeNotifier;
    }

    public async Task<Result> Handle(TrackProfileVisitCommand request, CancellationToken ct)
    {
        var profile = await _context.Profiles
            .FirstOrDefaultAsync(p => p.Id == request.ProfileId, ct);

        if (profile is null)
            return ProfileErrors.NotFoundById(request.ProfileId);

        var currentUserId = _currentUserService.UserId;

        // Avoid self-counting and self-notifying if creator views their own profile
        if (!string.IsNullOrWhiteSpace(currentUserId) && currentUserId == profile.UserId)
            return Result.Success();

        // 24 hour dedup check: registered user by userId, guest by visitorToken, fallback to hashedIp
        var since = DateTime.UtcNow.AddHours(-24);
        bool alreadyVisited;

        if (!string.IsNullOrWhiteSpace(currentUserId))
        {
            alreadyVisited = await _context.ProfileVisits
                .AnyAsync(v => v.ProfileId == request.ProfileId &&
                               v.VisitedAtUtc >= since &&
                               v.VisitorUserId == currentUserId, ct);
        }
        else if (!string.IsNullOrWhiteSpace(request.VisitorToken))
        {
            alreadyVisited = await _context.ProfileVisits
                .AnyAsync(v => v.ProfileId == request.ProfileId &&
                               v.VisitedAtUtc >= since &&
                               v.VisitorToken == request.VisitorToken, ct);
        }
        else
        {
            alreadyVisited = await _context.ProfileVisits
                .AnyAsync(v => v.ProfileId == request.ProfileId &&
                               v.VisitedAtUtc >= since &&
                               v.HashedIp == request.HashedIp, ct);
        }

        if (!alreadyVisited)
        {
            var isGuest = string.IsNullOrWhiteSpace(currentUserId);
            var visit = new ProfileVisit(
                request.ProfileId,
                request.HashedIp,
                isGuest ? null : currentUserId,
                request.VisitorToken);

            _context.ProfileVisits.Add(visit);

            var notificationMessage = isGuest ? "A guest viewed your profile" : "visited your profile";

            var notification = new Notification(
                profile.UserId,
                Domain.Enums.NotificationType.ProfileVisit,
                "Profile Visit",
                notificationMessage,
                null,
                isGuest ? null : currentUserId);

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync(ct);

            await _realtimeNotifier.PublishToUserAsync(
                profile.UserId,
                notification.Title,
                notification.Message,
                new { notification.Id, Type = notification.Type.ToString(), notification.CreatedAtUtc },
                ct);
        }

        return Result.Success();
    }
}
