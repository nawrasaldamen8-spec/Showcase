using Showcase.Application.Features.Notifications.Common;
using Showcase.Application.Features.Notifications.Events;

namespace Showcase.Application.Features.Notifications.Handlers;

public class ProfileVisitedNotificationHandler(
    IApplicationDbContext context,
    IRealtimeNotifier realtimeNotifier) : INotificationHandler<ProfileVisitedNotificationEvent>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IRealtimeNotifier _realtimeNotifier = realtimeNotifier;

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
