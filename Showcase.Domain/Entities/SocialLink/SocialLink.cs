using System;
using Showcase.Domain.Common.BaseEntity;
using Showcase.Domain.ValueObjects;

namespace Showcase.Domain.Entities;

public class SocialLink : BaseEntity
{
    public Guid ProfileId { get; private set; }
    public string Platform { get; private set; } = string.Empty;
    public Url Url { get; private set; } = null!;
    public int DisplayOrder { get; private set; }

    private SocialLink() { } // EF Core

    public SocialLink(Guid profileId, string platform, Url url, int displayOrder = 0)
    {
        if (profileId == Guid.Empty)
            throw new ArgumentException("ProfileId is required.", nameof(profileId));

        ProfileId = profileId;
        Update(platform, url);
        SetDisplayOrder(displayOrder);
    }

    public void Update(string platform, Url url)
    {
        if (string.IsNullOrWhiteSpace(platform))
            throw new ArgumentException("Platform is required.", nameof(platform));

        Platform = platform.Trim();
        Url = url ?? throw new ArgumentNullException(nameof(url));
    }

    public void SetDisplayOrder(int displayOrder)
    {
        DisplayOrder = displayOrder;
    }
}
