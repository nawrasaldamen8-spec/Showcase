using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Notifications.Common;
using Showcase.Application.Features.Notifications.Events;
using Showcase.Domain.Entities;
using Showcase.Domain.Enums;

namespace Showcase.Application.Features.Notifications.Handlers;

public class FeaturedApprovedNotificationHandler : INotificationHandler<FeaturedApprovedNotificationEvent>
{
    private readonly IApplicationDbContext _context;
    private readonly IRealtimeNotifier _realtimeNotifier;

    public FeaturedApprovedNotificationHandler(
        IApplicationDbContext context,
        IRealtimeNotifier realtimeNotifier)
    {
        _context = context;
        _realtimeNotifier = realtimeNotifier;
    }

    public async Task Handle(FeaturedApprovedNotificationEvent notification, CancellationToken ct)
    {
        var item = new Notification(
            notification.TargetUserId,
            NotificationType.FeaturedApproved,
            "Featured Status Approved",
            notification.Note ?? "Your profile has been featured!");

        await _context.SaveAndPublishNotificationAsync(_realtimeNotifier, item, ct);
    }
}

public class FeaturedRejectedNotificationHandler : INotificationHandler<FeaturedRejectedNotificationEvent>
{
    private readonly IApplicationDbContext _context;
    private readonly IRealtimeNotifier _realtimeNotifier;

    public FeaturedRejectedNotificationHandler(
        IApplicationDbContext context,
        IRealtimeNotifier realtimeNotifier)
    {
        _context = context;
        _realtimeNotifier = realtimeNotifier;
    }

    public async Task Handle(FeaturedRejectedNotificationEvent notification, CancellationToken ct)
    {
        var item = new Notification(
            notification.TargetUserId,
            NotificationType.FeaturedRejected,
            "Featured Status Update",
            notification.Note ?? "Your featured request was reviewed.");

        await _context.SaveAndPublishNotificationAsync(_realtimeNotifier, item, ct);
    }
}
