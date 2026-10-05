namespace Showcase.Application.Features.Notifications.Events;

public record ProfileVisitedNotificationEvent(
    string TargetUserId,
    string? VisitorUserId,
    bool IsGuest) : INotification;
