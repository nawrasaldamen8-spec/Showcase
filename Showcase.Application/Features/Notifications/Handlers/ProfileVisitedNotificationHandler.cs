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

        var cutoff = DateTime.UtcNow.AddHours(-24);
        var existingNotification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.UserId == notification.TargetUserId
                && n.Type == NotificationType.ProfileVisit
                && (!n.IsRead || n.CreatedAtUtc >= cutoff)
                && (notification.IsGuest ? n.SourceUserId == null : n.SourceUserId == notification.VisitorUserId), ct);

        if (existingNotification != null)
        {
            existingNotification.UpdateActorAndMessage(
                notification.IsGuest ? null : notification.VisitorUserId,
                notificationMessage);
            await _context.SaveChangesAsync(ct);

            await _realtimeNotifier.PublishToUserAsync(
                notification.TargetUserId,
                existingNotification.Title,
                existingNotification.Message,
                new { existingNotification.Id, Type = existingNotification.Type.ToString(), existingNotification.CreatedAtUtc },
                ct);
            return;
        }

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
