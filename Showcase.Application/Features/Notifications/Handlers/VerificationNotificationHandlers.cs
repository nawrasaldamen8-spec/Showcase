using Showcase.Application.Features.Notifications.Common;
using Showcase.Application.Features.Notifications.Events;

namespace Showcase.Application.Features.Notifications.Handlers;

public class VerificationApprovedNotificationHandler(
    IApplicationDbContext context,
    IRealtimeNotifier realtimeNotifier) : INotificationHandler<VerificationApprovedNotificationEvent>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IRealtimeNotifier _realtimeNotifier = realtimeNotifier;

    public async Task Handle(VerificationApprovedNotificationEvent notification, CancellationToken ct)
    {
        var pendingReq = await _context.VerificationRequests
            .FirstOrDefaultAsync(v => v.UserId == notification.TargetUserId && v.Status == VerificationStatus.Pending, ct);

        if (pendingReq is not null)
        {
            pendingReq.Approve(notification.Note);
        }

        var item = new Notification(
            notification.TargetUserId,
            NotificationType.VerificationApproved,
            "Verification Approved",
            notification.Note ?? "Your verification request has been approved!");

        await _context.SaveAndPublishNotificationAsync(_realtimeNotifier, item, ct);
    }
}

public class VerificationRejectedNotificationHandler(
    IApplicationDbContext context,
    IRealtimeNotifier realtimeNotifier) : INotificationHandler<VerificationRejectedNotificationEvent>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IRealtimeNotifier _realtimeNotifier = realtimeNotifier;

    public async Task Handle(VerificationRejectedNotificationEvent notification, CancellationToken ct)
    {
        var pendingReq = await _context.VerificationRequests
            .FirstOrDefaultAsync(v => v.UserId == notification.TargetUserId && v.Status == VerificationStatus.Pending, ct);

        if (pendingReq is not null)
        {
            pendingReq.Reject(notification.Note ?? "Verification removed by administrator.");
        }

        var item = new Notification(
            notification.TargetUserId,
            NotificationType.VerificationRejected,
            "Verification Update",
            notification.Note ?? "Your verification request could not be approved at this time.");

        await _context.SaveAndPublishNotificationAsync(_realtimeNotifier, item, ct);
    }
}
