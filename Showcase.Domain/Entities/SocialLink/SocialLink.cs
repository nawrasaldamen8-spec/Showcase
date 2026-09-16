using Showcase.Domain.Common.BaseEntity;
using Showcase.Domain.Enums;
using Showcase.Domain.ValueObjects;
using System;

namespace Showcase.Domain.Entities.SocialLink;

public class SocialLink : BaseEntity
{
    public Guid ProfileId { get; private set; }
    public SocialPlatform Platform { get; private set; }
    public Url LinkUrl { get; private set; } = null!;
    public int DisplayOrder { get; private set; }

    private SocialLink() { }

    public SocialLink(Guid profileId, SocialPlatform platform, Url linkUrl, int displayOrder)
    {
        if (profileId == Guid.Empty) throw new ArgumentException("ProfileId is required", nameof(profileId));
        ProfileId = profileId;
        Update(platform, linkUrl);
        ChangeOrder(displayOrder);
    }

    public void Update(SocialPlatform platform, Url linkUrl)
    {
        Platform = platform;
        LinkUrl = linkUrl ?? throw new ArgumentNullException(nameof(linkUrl));
    }

    public void ChangeOrder(int order) => DisplayOrder = order;
}
