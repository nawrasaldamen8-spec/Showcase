using System;
using Showcase.Domain.Common.BaseEntity;

namespace Showcase.Domain.Entities;

public class Tag : BaseEntity
{
    public const int MaxNameLength = 50;

    public string Name { get; private set; } = string.Empty;
    public string NormalizedName { get; private set; } = string.Empty;
    public DateTime CreatedAt { get; private set; }

    private Tag() { } // EF Core

    public Tag(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Tag name is required.", nameof(name));

        var trimmed = name.Trim();
        if (trimmed.Length > MaxNameLength)
            throw new ArgumentException($"Tag name cannot exceed {MaxNameLength} characters.", nameof(name));

        Name = trimmed;
        NormalizedName = NormalizeTag(trimmed);
        CreatedAt = DateTime.UtcNow;
    }

    public static string NormalizeTag(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return string.Empty;

        return name.Trim().ToLowerInvariant().Replace(" ", "-");
    }
}
