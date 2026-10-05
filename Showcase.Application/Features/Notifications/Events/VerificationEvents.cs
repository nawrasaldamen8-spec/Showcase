namespace Showcase.Application.Features.Notifications.Events;

public record VerificationApprovedNotificationEvent(
    string TargetUserId,
    string? Note) : INotification;

public record VerificationRejectedNotificationEvent(
    string TargetUserId,
    string? Note) : INotification;
