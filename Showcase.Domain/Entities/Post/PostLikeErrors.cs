namespace Showcase.Domain.Entities;

public static class PostLikeErrors
{
    public static readonly Error CannotLikeOwnPost =
        Error.Validation("PostLike.CannotLikeOwnPost", "You cannot like your own post.");

    public static readonly Error AlreadyLiked =
        Error.Conflict("PostLike.AlreadyLiked", "You have already liked this post.");

    public static readonly Error NotLiked =
        Error.NotFound("PostLike.NotLiked", "You have not liked this post.");
}
