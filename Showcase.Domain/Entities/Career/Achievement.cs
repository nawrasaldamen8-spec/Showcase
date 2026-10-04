using System;
using Showcase.Domain.Common.BaseEntity;
using Showcase.Domain.ValueObjects;

namespace Showcase.Domain.Entities;

public class Achievement : BaseEntity
{
    public Guid ProfileId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Type { get; private set; }
    public string? Organization { get; private set; }
    public string? Date { get; private set; }
    public Url? Url { get; private set; }
    public StorageKey? MediaUrl { get; private set; }
    public string? Description { get; private set; }
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

    private Achievement() { } // EF Core

    public Achievement(
        Guid profileId,
        string title,
        string? type = null,
        string? organization = null,
        string? date = null,
        Url? url = null,
        StorageKey? mediaUrl = null,
        string? description = null)
    {
        if (profileId == Guid.Empty)
            throw new ArgumentException("ProfileId is required.", nameof(profileId));

        ProfileId = profileId;
        Update(title, type, organization, date, url, mediaUrl, description);
    }

    public void Update(
        string title,
        string? type,
        string? organization,
        string? date,
        Url? url,
        StorageKey? mediaUrl,
        string? description)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required.", nameof(title));

        Title = title.Trim();
        Type = Normalize(type);
        Organization = Normalize(organization);
        Date = Normalize(date);
        Url = url;
        MediaUrl = mediaUrl;
        Description = Normalize(description);
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
