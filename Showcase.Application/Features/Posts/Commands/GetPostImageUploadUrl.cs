using Showcase.Application.Features.Posts.Common;

namespace Showcase.Application.Features.Posts.Commands;



public record GetPostImageUploadUrlCommand(
    Guid PostId,
    string ContentType,
    long FileSizeBytes) : IRequest<Result<PostImageUploadUrlResponse>>;



public class GetPostImageUploadUrlCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService,
    IStorageService storageService) : IRequestHandler<GetPostImageUploadUrlCommand, Result<PostImageUploadUrlResponse>>
{
    private readonly IApplicationDbContext _context = context;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IStorageService _storageService = storageService;

    public async Task<Result<PostImageUploadUrlResponse>> Handle(GetPostImageUploadUrlCommand request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
        {
            return Result.Failure<PostImageUploadUrlResponse>(profileResult.Error);
        }

        var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == request.PostId, ct);
        if (post is null)
        {
            return PostErrors.NotFound(request.PostId);
        }

        if (post.ProfileId != profileResult.Value.Id)
        {
            return PostErrors.UnauthorizedAccess;
        }

        var imageCount = await _context.PostImages.CountAsync(i => i.PostId == post.Id, ct);
        if (imageCount >= Post.MaxImagesPerPost)
        {
            return PostErrors.MaxImagesReached;
        }

        var storageKey = StorageKey.ForPostImage(profileResult.Value.UserId, post.Id, request.ContentType);

        var uploadUrl = await _storageService.GetPresignedUploadUrlAsync(
            storageKey.Value,
            request.ContentType.Trim().ToLowerInvariant(),
            TimeSpan.FromMinutes(15),
            ct);

        return new PostImageUploadUrlResponse(uploadUrl, storageKey.Value);
    }
}



public class GetPostImageUploadUrlCommandValidator : AbstractValidator<GetPostImageUploadUrlCommand>
{
    private static readonly string[] AllowedContentTypes =
    [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ];

    public const long MaxSizeBytes = 10 * 1024 * 1024; // 10 MB

    public GetPostImageUploadUrlCommandValidator()
    {
        RuleFor(x => x.PostId)
            .NotEmpty().WithMessage("Post ID is required.");

        RuleFor(x => x.ContentType)
            .NotEmpty().WithMessage("Content-Type is required.")
            .Must(type => AllowedContentTypes.Contains(type.Trim().ToLowerInvariant()))
            .WithMessage("Unsupported image format. Allowed formats: image/jpeg, image/png, image/webp, image/gif.");

        RuleFor(x => x.FileSizeBytes)
            .GreaterThan(0).WithMessage("File size must be greater than 0.")
            .LessThanOrEqualTo(MaxSizeBytes).WithMessage($"File size cannot exceed {MaxSizeBytes / (1024 * 1024)} MB.");
    }
}

