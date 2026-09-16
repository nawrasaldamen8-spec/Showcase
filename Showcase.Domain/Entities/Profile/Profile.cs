using Showcase.Domain.Common.BaseEntity;
using Showcase.Domain.ValueObjects;
using System;

namespace Showcase.Domain.Entities.Profile;

public class Profile : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string Bio { get; private set; } = string.Empty;
    public Url? ProfileImageUrl { get; private set; }
    public string Location { get; private set; } = string.Empty;

    private Profile() { } // EF Core

    public Profile(string name, string title, string bio, Url? profileImageUrl, string location)
    {
        UpdateProfile(name, title, bio, profileImageUrl, location);
    }

    public void UpdateProfile(string name, string title, string bio, Url? profileImageUrl, string location)
    {
        Name = string.IsNullOrWhiteSpace(name) ? throw new ArgumentNullException(nameof(name)) : name;
        Title = title ?? string.Empty;
        Bio = bio ?? string.Empty;
        ProfileImageUrl = profileImageUrl;
        Location = location ?? string.Empty;
    }
}
