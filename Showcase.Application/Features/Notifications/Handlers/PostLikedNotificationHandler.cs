using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Notifications.Common;
using Showcase.Application.Features.Notifications.Events;
using Showcase.Domain.Entities;
using Showcase.Domain.Enums;

namespace Showcase.Application.Features.Notifications.Handlers;

public class PostLikedNotificationHandler : INotificationHandler<PostLikedNotificationEvent>
{
    private readonly IApplicationDbContext _context;
    private readonly IRealtimeNotifier _realtimeNotifier;

    public PostLikedNotificationHandler(
        IApplicationDbContext context,
        IRealtimeNotifier realtimeNotifier)
    {
        _context = context;
        _realtimeNotifier = realtimeNotifier;
    }

    public async Task Handle(PostLikedNotificationEvent notification, CancellationToken ct)
    {
        if (notification.TargetUserId == notification.SourceUserId)
            return; // Avoid notifying self

        // Check if there is an existing unread Like notification on the same Post to aggregate
        var existingNotification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.UserId == notification.TargetUserId
                && n.Type == NotificationType.Like
                && n.SourcePostId == notification.PostId
                && !n.IsRead, ct);

        if (existingNotification != null)
        {
            existingNotification.UpdateActorAndMessage(
                notification.SourceUserId,
                "and others liked your project");
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
            NotificationType.Like,
            "Like",
            "liked your project",
            notification.PostId,
            notification.SourceUserId);

        await _context.SaveAndPublishNotificationAsync(_realtimeNotifier, item, ct);
    }
}
