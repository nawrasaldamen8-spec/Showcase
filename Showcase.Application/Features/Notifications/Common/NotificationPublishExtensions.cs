namespace Showcase.Application.Features.Notifications.Common;

public static class NotificationPublishExtensions
{
    public static async Task SaveAndPublishNotificationAsync(
        this IApplicationDbContext context,
        IRealtimeNotifier realtimeNotifier,
        Notification notification,
        CancellationToken ct = default)
    {
        context.Notifications.Add(notification);
        await context.SaveChangesAsync(ct);

        await realtimeNotifier.PublishToUserAsync(
            notification.UserId,
            notification.Title,
            notification.Message,
            new { notification.Id, Type = notification.Type.ToString(), notification.CreatedAtUtc },
            ct);
    }
}
