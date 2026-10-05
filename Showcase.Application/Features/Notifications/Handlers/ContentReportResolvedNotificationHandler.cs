using Showcase.Application.Features.Notifications.Common;
using Showcase.Application.Features.Notifications.Events;

namespace Showcase.Application.Features.Notifications.Handlers;

public class ContentReportResolvedNotificationHandler(
    IApplicationDbContext context,
    IRealtimeNotifier realtimeNotifier) : INotificationHandler<ContentReportResolvedNotificationEvent>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IRealtimeNotifier _realtimeNotifier = realtimeNotifier;

    public async Task Handle(ContentReportResolvedNotificationEvent notification, CancellationToken ct)
    {
        string? targetUserId = null;
        Guid? sourcePostId = null;

        if (notification.TargetType.Equals("POST", StringComparison.OrdinalIgnoreCase) ||
            notification.TargetType.Equals("WORK", StringComparison.OrdinalIgnoreCase))
        {
            if (Guid.TryParse(notification.TargetId, out var postId))
            {
                sourcePostId = postId;
                var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == postId, ct);
                if (post is not null)
                {
                    var profile = await _context.Profiles
                        .IgnoreQueryFilters()
                        .FirstOrDefaultAsync(p => p.Id == post.ProfileId, ct);
                    targetUserId = profile?.UserId;
                }
            }
        }
        else if (notification.TargetType.Equals("USER", StringComparison.OrdinalIgnoreCase) ||
                 notification.TargetType.Equals("PROFILE", StringComparison.OrdinalIgnoreCase))
        {
            targetUserId = notification.TargetId;
        }

        if (!string.IsNullOrWhiteSpace(targetUserId))
        {
            var warningNotification = new Notification(
                targetUserId,
                NotificationType.System,
                "Moderation Notice",
                $"Administrative review for '{notification.TargetLabel}': {notification.ActionTaken}",
                sourcePostId);

            await _context.SaveAndPublishNotificationAsync(_realtimeNotifier, warningNotification, ct);
        }
    }
}
