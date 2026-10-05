namespace Showcase.Application.Features.Notifications.Events;

public record FeaturedApprovedNotificationEvent(
    string TargetUserId,
    string? Note) : INotification;

public record FeaturedRejectedNotificationEvent(
    string TargetUserId,
    string? Note) : INotification;
