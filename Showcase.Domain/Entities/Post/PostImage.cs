using System;
using Showcase.Domain.Common.BaseEntity;
using Showcase.Domain.ValueObjects;

namespace Showcase.Domain.Entities;

public class PostImage : BaseEntity
{
    public Guid PostId { get; private set; }
    public StorageKey StorageKey { get; private set; } = null!;
    public int DisplayOrder { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private PostImage() { } // EF Core

    public PostImage(Guid postId, StorageKey storageKey, int displayOrder = 0)
    {
        if (postId == Guid.Empty)
            throw new ArgumentException("PostId is required.", nameof(postId));

        PostId = postId;
        StorageKey = storageKey ?? throw new ArgumentNullException(nameof(storageKey));
        DisplayOrder = displayOrder;
        CreatedAt = DateTime.UtcNow;
    }

    public void SetDisplayOrder(int displayOrder)
    {
        DisplayOrder = displayOrder;
    }
}
