using System;
using System.Collections.Generic;
using System.Linq;
using Showcase.Domain.Common.BaseEntity;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Enums;
using Showcase.Domain.ValueObjects;

namespace Showcase.Domain.Entities;

public class Post : BaseEntity
{
    private readonly List<PostImage> _images = new();

    public Guid ProfileId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public Url? ExternalUrl { get; private set; }
    public PostStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? PublishedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public IReadOnlyCollection<PostImage> Images => _images.AsReadOnly();

    private Post() { } // EF Core

    public Post(Guid profileId, string title, string description = "", Url? externalUrl = null)
    {
        if (profileId == Guid.Empty)
            throw new ArgumentException("ProfileId is required.", nameof(profileId));

        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required.", nameof(title));

        ProfileId = profileId;
        Title = title.Trim();
        Description = description?.Trim() ?? string.Empty;
        ExternalUrl = externalUrl;
        Status = PostStatus.Draft;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(string title, string description, Url? externalUrl)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required.", nameof(title));

        Title = title.Trim();
        Description = description?.Trim() ?? string.Empty;
        ExternalUrl = externalUrl;
        UpdatedAt = DateTime.UtcNow;
    }

    public Result Publish()
    {
        if (_images.Count == 0)
            return PostErrors.CannotPublishEmptyPost;

        Status = PostStatus.Published;
        PublishedAt ??= DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Unpublish()
    {
        Status = PostStatus.Unpublished;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public PostImage AddImage(StorageKey storageKey, int? displayOrder = null)
    {
        if (storageKey is null)
            throw new ArgumentNullException(nameof(storageKey));

        var order = displayOrder ?? (_images.Count > 0 ? _images.Max(x => x.DisplayOrder) + 1 : 0);
        var image = new PostImage(Id, storageKey, order);
        _images.Add(image);
        UpdatedAt = DateTime.UtcNow;
        return image;
    }

    public Result RemoveImage(Guid imageId)
    {
        var image = _images.FirstOrDefault(i => i.Id == imageId);
        if (image is null)
            return PostImageErrors.NotFound(imageId);

        if (Status == PostStatus.Published && _images.Count <= 1)
            return PostErrors.CannotPublishEmptyPost;

        _images.Remove(image);
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public void ReorderImages(IReadOnlyDictionary<Guid, int> imageOrders)
    {
        ArgumentNullException.ThrowIfNull(imageOrders);

        foreach (var (id, order) in imageOrders)
        {
            var image = _images.FirstOrDefault(i => i.Id == id);
            image?.SetDisplayOrder(order);
        }

        UpdatedAt = DateTime.UtcNow;
    }
}
