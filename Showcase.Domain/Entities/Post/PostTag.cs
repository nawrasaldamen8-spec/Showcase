namespace Showcase.Domain.Entities;

public class PostTag : BaseEntity
{
    public Guid PostId { get; private set; }
    public Guid TagId { get; private set; }
    public Tag Tag { get; private set; } = null!;
    public DateTime CreatedAt { get; private set; }

    private PostTag() { } // EF Core

    public PostTag(Guid postId, Guid tagId)
    {
        if (postId == Guid.Empty)
            throw new ArgumentException("PostId is required.", nameof(postId));

        if (tagId == Guid.Empty)
            throw new ArgumentException("TagId is required.", nameof(tagId));

        PostId = postId;
        TagId = tagId;
        CreatedAt = DateTime.UtcNow;
    }
}
