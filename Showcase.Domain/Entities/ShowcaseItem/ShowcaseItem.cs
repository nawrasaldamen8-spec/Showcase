using Showcase.Domain.Common.BaseEntity;
using Showcase.Domain.ValueObjects;
using System;

namespace Showcase.Domain.Entities.ShowcaseItem;

public class ShowcaseItem : BaseEntity
{
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public Url? ImageUrl { get; private set; }
    public Url? LinkUrl { get; private set; }
    public int DisplayOrder { get; private set; }
    public bool IsFeatured { get; private set; }

    private ShowcaseItem() { }

    public ShowcaseItem(string title, string description, Url? imageUrl, Url? linkUrl, int displayOrder, bool isFeatured)
    {
        UpdateDetails(title, description, imageUrl, linkUrl);
        ChangeOrder(displayOrder);
        if (isFeatured) SetFeatured(); else RemoveFeatured();
    }

    public void UpdateDetails(string title, string description, Url? imageUrl, Url? linkUrl)
    {
        Title = string.IsNullOrWhiteSpace(title) ? throw new ArgumentNullException(nameof(title)) : title;
        Description = description ?? string.Empty;
        ImageUrl = imageUrl;
        LinkUrl = linkUrl;
    }

    public void SetFeatured() => IsFeatured = true;
    public void RemoveFeatured() => IsFeatured = false;
    public void ChangeOrder(int order) => DisplayOrder = order;
}
