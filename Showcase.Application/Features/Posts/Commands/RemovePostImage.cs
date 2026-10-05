namespace Showcase.Application.Features.Posts.Commands;



public record RemovePostImageCommand(
    Guid PostId,
    Guid ImageId) : IRequest<Result>;



public class RemovePostImageCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService,
    IStorageService storageService) : IRequestHandler<RemovePostImageCommand, Result>
{
    private readonly IApplicationDbContext _context = context;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IStorageService _storageService = storageService;

    public async Task<Result> Handle(RemovePostImageCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthorized", "User is not authenticated.");
        }

        var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);
        if (profile is null)
        {
            return ProfileErrors.NotFoundForUser(userId);
        }

        var post = await _context.Posts
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == request.PostId, ct);

        if (post is null)
        {
            return PostErrors.NotFound(request.PostId);
        }

        if (post.ProfileId != profile.Id)
        {
            return PostErrors.UnauthorizedAccess;
        }

        var image = post.Images.FirstOrDefault(i => i.Id == request.ImageId);
        if (image is null)
        {
            return PostImageErrors.NotFound(request.ImageId);
        }

        var storageKey = image.StorageKey.Value;

        var removeResult = post.RemoveImage(request.ImageId);
        if (removeResult.IsFailure)
        {
            return removeResult;
        }

        try
        {
            await _storageService.DeleteAsync(storageKey, ct);
        }
        catch
        {
            // Best effort cleanup
        }

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}

