namespace Showcase.Application.Features.SocialLinks.Commands;



public record UpdateSocialLinkCommand(
    Guid Id,
    string Platform,
    string Url) : IRequest<Result>;



public class UpdateSocialLinkCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<UpdateSocialLinkCommand, Result>
{
    private readonly IApplicationDbContext _context = context;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result> Handle(UpdateSocialLinkCommand request, CancellationToken ct)
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

        var urlResult = Url.Create(request.Url);
        if (urlResult.IsFailure)
        {
            return Result.Failure(urlResult.Error);
        }

        var updateResult = profile.UpdateSocialLink(request.Id, request.Platform, urlResult.Value);
        if (updateResult.IsFailure)
        {
            return updateResult;
        }

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}



public class UpdateSocialLinkCommandValidator : AbstractValidator<UpdateSocialLinkCommand>
{
    public UpdateSocialLinkCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Social link ID is required.");

        RuleFor(x => x.Platform)
            .NotEmpty().WithMessage("Platform is required.")
            .MaximumLength(50).WithMessage("Platform cannot exceed 50 characters.");

        RuleFor(x => x.Url)
            .NotEmpty().WithMessage("URL is required.")
            .MaximumLength(Url.MaxLength).WithMessage($"URL cannot exceed {Url.MaxLength} characters.")
            .Must(BeAValidHttpUrl).WithMessage("URL must be a valid HTTP or HTTPS URL.");
    }

    private static bool BeAValidHttpUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult) &&
               (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}

