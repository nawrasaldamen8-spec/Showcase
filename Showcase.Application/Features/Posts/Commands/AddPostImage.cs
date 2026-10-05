using Showcase.Application.Features.Posts.Common;

namespace Showcase.Application.Features.Posts.Commands;



public record AddPostImageCommand(
    Guid PostId,
    string StorageKey,
    int? DisplayOrder = null) : IRequest<Result<PostImageDto>>;



public class AddPostImageCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService,
    IStorageService storageService) : IRequestHandler<AddPostImageCommand, Result<PostImageDto>>
{
    private readonly IApplicationDbContext _context = context;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IStorageService _storageService = storageService;

    public async Task<Result<PostImageDto>> Handle(AddPostImageCommand request, CancellationToken ct)
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

        var storageKeyResult = StorageKey.Create(request.StorageKey);
        if (storageKeyResult.IsFailure)
        {
            return Result.Failure<PostImageDto>(storageKeyResult.Error);
        }

        var imageResult = post.AddImage(storageKeyResult.Value, request.DisplayOrder);
        if (imageResult.IsFailure)
        {
            return Result.Failure<PostImageDto>(imageResult.Error);
        }

        var image = imageResult.Value;
        _context.PostImages.Add(image);
        await _context.SaveChangesAsync(ct);

        var url = _storageService.GetPublicUrl(image.StorageKey.Value);
        return new PostImageDto(image.Id, image.StorageKey.Value, url, image.DisplayOrder);
    }
}



public class AddPostImageCommandValidator : AbstractValidator<AddPostImageCommand>
{
    public AddPostImageCommandValidator()
    {
        RuleFor(x => x.PostId)
            .NotEmpty().WithMessage("Post ID is required.");

        RuleFor(x => x.StorageKey)
            .NotEmpty().WithMessage("Storage key is required.")
            .MaximumLength(StorageKey.MaxLength).WithMessage($"Storage key cannot exceed {StorageKey.MaxLength} characters.");

        RuleFor(x => x.DisplayOrder)
            .GreaterThanOrEqualTo(0).WithMessage("Display order cannot be negative.")
            .When(x => x.DisplayOrder.HasValue);
    }
}

