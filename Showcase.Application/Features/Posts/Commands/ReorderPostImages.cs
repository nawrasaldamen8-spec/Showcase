namespace Showcase.Application.Features.Posts.Commands;



public record ReorderPostImageItem(Guid Id, int DisplayOrder);

public record ReorderPostImagesCommand(
    Guid PostId,
    IReadOnlyList<ReorderPostImageItem> Items) : IRequest<Result>;



public class ReorderPostImagesCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<ReorderPostImagesCommand, Result>
{
    private readonly IApplicationDbContext _context = context;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result> Handle(ReorderPostImagesCommand request, CancellationToken ct)
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

        var dictionary = request.Items.ToDictionary(x => x.Id, x => x.DisplayOrder);
        post.ReorderImages(dictionary);

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}



public class ReorderPostImagesCommandValidator : AbstractValidator<ReorderPostImagesCommand>
{
    public ReorderPostImagesCommandValidator()
    {
        RuleFor(x => x.PostId)
            .NotEmpty().WithMessage("Post ID is required.");

        RuleFor(x => x.Items)
            .NotNull().WithMessage("Items list is required.")
            .NotEmpty().WithMessage("At least one image item must be provided.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.Id)
                .NotEmpty().WithMessage("Image ID is required.");

            item.RuleFor(i => i.DisplayOrder)
                .GreaterThanOrEqualTo(0).WithMessage("Display order cannot be negative.");
        });
    }
}

