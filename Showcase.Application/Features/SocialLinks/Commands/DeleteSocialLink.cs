namespace Showcase.Application.Features.SocialLinks.Commands;



public record DeleteSocialLinkCommand(Guid Id) : IRequest<Result>;



public class DeleteSocialLinkCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<DeleteSocialLinkCommand, Result>
{
    private readonly IApplicationDbContext _context = context;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result> Handle(DeleteSocialLinkCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthorized", "User is not authenticated.");
        }

        var profile = await _context.Profiles
            .Include(p => p.SocialLinks)
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);

        if (profile is null)
        {
            return ProfileErrors.NotFoundForUser(userId);
        }

        var removeResult = profile.RemoveSocialLink(request.Id);
        if (removeResult.IsFailure)
        {
            return removeResult;
        }

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}

