using System;
using System.Collections.Generic;
using System.Linq;
using Showcase.Domain.Common.BaseEntity;
using Showcase.Domain.Common.Results;
using Showcase.Domain.ValueObjects;

namespace Showcase.Domain.Entities;

public class Profile : BaseEntity
{
    private readonly List<SocialLink> _socialLinks = new();

    public string UserId { get; private set; } = string.Empty;
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public Bio? Bio { get; private set; }
    public StorageKey? AvatarKey { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public IReadOnlyCollection<SocialLink> SocialLinks => _socialLinks.AsReadOnly();

    private Profile() { } // EF Core

    public Profile(string userId, string firstName, string lastName, Bio? bio = null, StorageKey? avatarKey = null)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("UserId is required.", nameof(userId));

        if (string.IsNullOrWhiteSpace(firstName))
            throw new ArgumentException("FirstName is required.", nameof(firstName));

        if (string.IsNullOrWhiteSpace(lastName))
            throw new ArgumentException("LastName is required.", nameof(lastName));

        UserId = userId;
        FirstName = firstName.Trim();
        LastName = lastName.Trim();
        Bio = bio;
        AvatarKey = avatarKey;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(string firstName, string lastName, Bio? bio)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            throw new ArgumentException("FirstName is required.", nameof(firstName));

        if (string.IsNullOrWhiteSpace(lastName))
            throw new ArgumentException("LastName is required.", nameof(lastName));

        FirstName = firstName.Trim();
        LastName = lastName.Trim();
        Bio = bio;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetAvatar(StorageKey avatarKey)
    {
        AvatarKey = avatarKey ?? throw new ArgumentNullException(nameof(avatarKey));
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveAvatar()
    {
        AvatarKey = null;
        UpdatedAt = DateTime.UtcNow;
    }

    public SocialLink AddSocialLink(string platform, Url url, int? displayOrder = null)
    {
        var order = displayOrder ?? (_socialLinks.Count > 0 ? _socialLinks.Max(x => x.DisplayOrder) + 1 : 0);
        var link = new SocialLink(Id, platform, url, order);
        _socialLinks.Add(link);
        UpdatedAt = DateTime.UtcNow;
        return link;
    }

    public Result UpdateSocialLink(Guid socialLinkId, string platform, Url url)
    {
        var link = _socialLinks.FirstOrDefault(l => l.Id == socialLinkId);
        if (link is null)
            return SocialLinkErrors.NotFound(socialLinkId);

        link.Update(platform, url);
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result RemoveSocialLink(Guid socialLinkId)
    {
        var link = _socialLinks.FirstOrDefault(l => l.Id == socialLinkId);
        if (link is null)
            return SocialLinkErrors.NotFound(socialLinkId);

        _socialLinks.Remove(link);
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public void ReorderSocialLinks(IReadOnlyDictionary<Guid, int> orderedSocialLinks)
    {
        ArgumentNullException.ThrowIfNull(orderedSocialLinks);

        foreach (var (id, order) in orderedSocialLinks)
        {
            var link = _socialLinks.FirstOrDefault(l => l.Id == id);
            link?.SetDisplayOrder(order);
        }

        UpdatedAt = DateTime.UtcNow;
    }
}
