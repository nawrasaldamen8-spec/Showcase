namespace Showcase.Application.Features.Posts.Commands;



public record UnpublishPostCommand(Guid Id) : IRequest<Result>;



public class UnpublishPostCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<UnpublishPostCommand, Result>
{
    private readonly IApplicationDbContext _context = context;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result> Handle(UnpublishPostCommand request, CancellationToken ct)
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

        var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == request.Id, ct);
        if (post is null)
        {
            return PostErrors.NotFound(request.Id);
        }

        if (post.ProfileId != profile.Id)
        {
            return PostErrors.UnauthorizedAccess;
        }

        var unpublishResult = post.Unpublish();
        if (unpublishResult.IsFailure)
        {
            return unpublishResult;
        }

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}

