namespace Showcase.Domain.Entities;

public static class NotificationErrors
{
    public static Error NotFound(Guid id) =>
        Error.NotFound("Notification.NotFound", $"Notification with ID '{id}' was not found.");

    public static readonly Error UnauthorizedAccess =
        Error.Forbidden("Notification.UnauthorizedAccess", "You are not authorized to access this notification.");
}
