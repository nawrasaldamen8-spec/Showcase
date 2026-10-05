using Showcase.Application.Features.Notifications.Events;

namespace Showcase.Application.Features.Posts.Commands;



public record DeletePostCommand(Guid Id) : IRequest<Result>;



public class DeletePostCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService,
    IPublisher publisher) : IRequestHandler<DeletePostCommand, Result>
{
    private readonly IApplicationDbContext _context = context;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IPublisher _publisher = publisher;

    public async Task<Result> Handle(DeletePostCommand request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
        {
            return profileResult.Error;
        }

        var post = await _context.Posts
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == request.Id, ct);

        if (post is null)
        {
            return PostErrors.NotFound(request.Id);
        }

        if (post.ProfileId != profileResult.Value.Id)
        {
            return PostErrors.UnauthorizedAccess;
        }

        var storageKeys = post.Images
            .Select(i => i.StorageKey.Value)
            .ToList();

        _context.Posts.Remove(post);
        await _context.SaveChangesAsync(ct);

        await _publisher.Publish(new PostDeletedNotificationEvent(post.Id, storageKeys), ct);

        return Result.Success();
    }
}

