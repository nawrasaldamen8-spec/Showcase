using Showcase.Application.Features.Notifications.Events;

namespace Showcase.Application.Features.Posts.Commands;



public record ToggleLikePostCommand(Guid PostId, bool? DesiredState = null) : IRequest<Result<ToggleLikePostResponse>>;



public class ToggleLikePostCommandHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context,
    IPublisher publisher) : IRequestHandler<ToggleLikePostCommand, Result<ToggleLikePostResponse>>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;
    private readonly IPublisher _publisher = publisher;

    public async Task<Result<ToggleLikePostResponse>> Handle(ToggleLikePostCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");
        }

        var post = await _context.Posts.AsTracking().FirstOrDefaultAsync(p => p.Id == request.PostId, ct);
        if (post is null)
        {
            return PostErrors.NotFound(request.PostId);
        }

        var existingLike = await _context.PostLikes
            .AsTracking()
            .FirstOrDefaultAsync(l => l.PostId == request.PostId && l.UserId == userId, ct);

        var isCurrentlyLiked = existingLike is not null;
        var shouldBeLiked = request.DesiredState ?? !isCurrentlyLiked;

        if (shouldBeLiked == isCurrentlyLiked)
        {
            return new ToggleLikePostResponse(isCurrentlyLiked, post.LikesCount);
        }

        if (shouldBeLiked)
        {
            _context.PostLikes.Add(new PostLike(post.Id, userId));
            post.IncrementLikes();
        }
        else
        {
            _context.PostLikes.Remove(existingLike!);
            post.DecrementLikes();
        }

        await _context.SaveChangesAsync(ct);

        if (shouldBeLiked)
        {
            var targetUserId = await _context.Profiles
                .Where(p => p.Id == post.ProfileId)
                .Select(p => p.UserId)
                .FirstOrDefaultAsync(ct);

            if (!string.IsNullOrWhiteSpace(targetUserId))
            {
                await _publisher.Publish(new PostLikedNotificationEvent(
                    targetUserId,
                    userId,
                    post.Id,
                    post.Title), ct);
            }
        }

        return new ToggleLikePostResponse(shouldBeLiked, post.LikesCount);
    }
}


public record ToggleLikePostResponse(bool IsLiked, int LikeCount);

