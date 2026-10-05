namespace Showcase.Domain.Entities;

public class PostLike : BaseEntity
{
    public Guid PostId { get; private set; }
    public string UserId { get; private set; } = string.Empty;
    public DateTime CreatedAtUtc { get; private set; }

    private PostLike() { } // EF Core

    public PostLike(Guid postId, string userId)
    {
        if (postId == Guid.Empty)
            throw new ArgumentException("PostId is required.", nameof(postId));

        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("UserId is required.", nameof(userId));

        PostId = postId;
        UserId = userId.Trim();
        CreatedAtUtc = DateTime.UtcNow;
    }
}
