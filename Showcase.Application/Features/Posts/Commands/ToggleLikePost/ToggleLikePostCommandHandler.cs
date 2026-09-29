using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Posts.Commands.ToggleLikePost;

public class ToggleLikePostCommandHandler : IRequestHandler<ToggleLikePostCommand, Result<ToggleLikePostResponse>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;
    private readonly IPublisher _publisher;

    public ToggleLikePostCommandHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context,
        IPublisher publisher)
    {
        _currentUserService = currentUserService;
        _context = context;
        _publisher = publisher;
    }

    public async Task<Result<ToggleLikePostResponse>> Handle(ToggleLikePostCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == request.PostId, ct);
        if (post is null)
            return PostErrors.NotFound(request.PostId);

        var existingLike = await _context.PostLikes
            .FirstOrDefaultAsync(l => l.PostId == request.PostId && l.UserId == userId, ct);

        bool isLikedNow;
        if (existingLike is not null)
        {
            _context.PostLikes.Remove(existingLike);
            post.DecrementLikes();
            isLikedNow = false;
        }
        else
        {
            var newLike = new PostLike(request.PostId, userId);
            _context.PostLikes.Add(newLike);
            post.IncrementLikes();
            isLikedNow = true;
        }

        await _context.SaveChangesAsync(ct);

        if (isLikedNow)
        {
            var targetUserId = await _context.Profiles
                .Where(p => p.Id == post.ProfileId)
                .Select(p => p.UserId)
                .FirstOrDefaultAsync(ct);

            if (!string.IsNullOrWhiteSpace(targetUserId))
            {
                await _publisher.Publish(new Showcase.Application.Features.Notifications.Events.PostLikedNotificationEvent(
                    targetUserId,
                    userId,
                    post.Id,
                    post.Title), ct);
            }
        }

        return new ToggleLikePostResponse(isLikedNow, post.LikesCount);
    }
}
