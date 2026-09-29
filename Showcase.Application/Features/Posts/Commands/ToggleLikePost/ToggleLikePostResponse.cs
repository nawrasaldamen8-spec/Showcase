namespace Showcase.Application.Features.Posts.Commands.ToggleLikePost;

public record ToggleLikePostResponse(bool IsLiked, int LikeCount);
