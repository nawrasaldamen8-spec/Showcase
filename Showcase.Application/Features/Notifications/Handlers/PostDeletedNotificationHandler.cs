using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Notifications.Events;

namespace Showcase.Application.Features.Notifications.Handlers;

public class PostDeletedNotificationHandler : INotificationHandler<PostDeletedNotificationEvent>
{
    private readonly IApplicationDbContext _context;
    private readonly IStorageService _storageService;
    private readonly ILogger<PostDeletedNotificationHandler> _logger;

    public PostDeletedNotificationHandler(
        IApplicationDbContext context,
        IStorageService storageService,
        ILogger<PostDeletedNotificationHandler> logger)
    {
        _context = context;
        _storageService = storageService;
        _logger = logger;
    }

    public async Task Handle(PostDeletedNotificationEvent notification, CancellationToken ct)
    {
        if (notification.StorageKeys.Count > 0)
        {
            var deleteTasks = notification.StorageKeys.Select(async key =>
            {
                try
                {
                    await _storageService.DeleteAsync(key, ct);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to delete storage asset {StorageKey} for post {PostId}", key, notification.PostId);
                }
            });

            await Task.WhenAll(deleteTasks);
        }

        var relatedNotifications = await _context.Notifications
            .Where(n => n.SourcePostId == notification.PostId)
            .ToListAsync(ct);

        if (relatedNotifications.Count > 0)
        {
            _context.Notifications.RemoveRange(relatedNotifications);
            await _context.SaveChangesAsync(ct);
        }
    }
}
