using Showcase.Application.Features.Posts.Common;

namespace Showcase.Application.Features.Posts.Commands;



public record UpdatePostCommand(
    Guid Id,
    string Title,
    string Description = "",
    string? ExternalUrl = null,
    IReadOnlyList<string>? Tags = null) : IRequest<Result>;



public class UpdatePostCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<UpdatePostCommand, Result>
{
    private readonly IApplicationDbContext _context = context;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result> Handle(UpdatePostCommand request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
        {
            return profileResult.Error;
        }

        var post = await _context.Posts
            .Include(p => p.PostTags)
            .FirstOrDefaultAsync(p => p.Id == request.Id, ct);

        if (post is null)
        {
            return PostErrors.NotFound(request.Id);
        }

        if (post.ProfileId != profileResult.Value.Id)
        {
            return PostErrors.UnauthorizedAccess;
        }

        var urlResult = Url.CreateOptional(request.ExternalUrl);
        if (urlResult.IsFailure)
        {
            return urlResult.Error;
        }

        post.UpdateDetails(request.Title, request.Description, urlResult.Value);

        if (request.Tags is not null)
        {
            post.ClearTags();
            await post.AttachTagsAsync(_context, request.Tags, ct);
        }

        await _context.SaveChangesAsync(ct);

        return Result.Success();
    }
}



public class UpdatePostCommandValidator : AbstractValidator<UpdatePostCommand>
{
    public UpdatePostCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Post ID is required.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title cannot exceed 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(4000).WithMessage("Description cannot exceed 4000 characters.");

        RuleFor(x => x.ExternalUrl)
            .MaximumLength(Url.MaxLength).WithMessage($"External URL cannot exceed {Url.MaxLength} characters.")
            .Must(BeAValidHttpUrl).WithMessage("External URL must be a valid HTTP or HTTPS URL.")
            .When(x => !string.IsNullOrWhiteSpace(x.ExternalUrl));
    }

    private static bool BeAValidHttpUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return true;
        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult) &&
               (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}

