using System;
using Showcase.Domain.Common.BaseEntity;
using Showcase.Domain.Enums;

namespace Showcase.Domain.Entities;

public class Notification : BaseEntity
{
    public string UserId { get; private set; } = string.Empty;
    public NotificationType Type { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Message { get; private set; } = string.Empty;
    public Guid? SourcePostId { get; private set; }
    public string? SourceUserId { get; private set; }
    public bool IsRead { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }

    private Notification() { } // EF Core

    public Notification(
        string userId,
        NotificationType type,
        string title,
        string message,
        Guid? sourcePostId = null,
        string? sourceUserId = null)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("UserId is required.", nameof(userId));

        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required.", nameof(title));

        if (string.IsNullOrWhiteSpace(message))
            throw new ArgumentException("Message is required.", nameof(message));

        UserId = userId.Trim();
        Type = type;
        Title = title.Trim();
        Message = message.Trim();
        SourcePostId = sourcePostId;
        SourceUserId = string.IsNullOrWhiteSpace(sourceUserId) ? null : sourceUserId.Trim();
        IsRead = false;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public void MarkAsRead()
    {
        IsRead = true;
    }
}
