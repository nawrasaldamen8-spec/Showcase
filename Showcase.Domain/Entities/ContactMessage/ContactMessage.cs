using Showcase.Domain.Common.BaseEntity;
using Showcase.Domain.ValueObjects;
using System;

namespace Showcase.Domain.Entities.ContactMessage;

public class ContactMessage : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public Email EmailAddress { get; private set; } = null!;
    public string Subject { get; private set; } = string.Empty;
    public string Message { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; }
    public bool IsRead { get; private set; }

    private ContactMessage() { }

    public ContactMessage(string name, Email emailAddress, string subject, string message)
    {
        Name = string.IsNullOrWhiteSpace(name) ? throw new ArgumentNullException(nameof(name)) : name;
        EmailAddress = emailAddress ?? throw new ArgumentNullException(nameof(emailAddress));
        Subject = subject ?? string.Empty;
        Message = string.IsNullOrWhiteSpace(message) ? throw new ArgumentNullException(nameof(message)) : message;
        CreatedAt = DateTimeOffset.UtcNow;
        IsRead = false;
    }

    public void MarkAsRead() => IsRead = true;
}
