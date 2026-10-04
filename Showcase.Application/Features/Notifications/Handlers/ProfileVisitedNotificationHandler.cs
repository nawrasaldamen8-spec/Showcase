using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Notifications.Common;
using Showcase.Application.Features.Notifications.Events;
using Showcase.Domain.Entities;
using Showcase.Domain.Enums;

namespace Showcase.Application.Features.Notifications.Handlers;

public class ProfileVisitedNotificationHandler : INotificationHandler<ProfileVisitedNotificationEvent>
{
    private readonly IApplicationDbContext _context;
    private readonly IRealtimeNotifier _realtimeNotifier;

    public ProfileVisitedNotificationHandler(
        IApplicationDbContext context,
        IRealtimeNotifier realtimeNotifier)
    {
        _context = context;
        _realtimeNotifier = realtimeNotifier;
    }

    public async Task Handle(ProfileVisitedNotificationEvent notification, CancellationToken ct)
    {
        var notificationMessage = notification.IsGuest
            ? "A guest viewed your profile"
            : "visited your profile";

        var item = new Notification(
            notification.TargetUserId,
            NotificationType.ProfileVisit,
            "Profile Visit",
            notificationMessage,
            null,
            notification.IsGuest ? null : notification.VisitorUserId);

        await _context.SaveAndPublishNotificationAsync(_realtimeNotifier, item, ct);
    }
}
