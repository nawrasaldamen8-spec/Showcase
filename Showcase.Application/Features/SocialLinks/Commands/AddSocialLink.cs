using Showcase.Application.Features.Profiles.Common;

namespace Showcase.Application.Features.SocialLinks.Commands;



public record AddSocialLinkCommand(
    string Platform,
    string Url,
    int? DisplayOrder = null) : IRequest<Result<SocialLinkDto>>;



public class AddSocialLinkCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<AddSocialLinkCommand, Result<SocialLinkDto>>
{
    private readonly IApplicationDbContext _context = context;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<SocialLinkDto>> Handle(AddSocialLinkCommand request, CancellationToken ct)
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
            return Result.Failure<SocialLinkDto>(urlResult.Error);
        }

        var link = profile.AddSocialLink(request.Platform, urlResult.Value, request.DisplayOrder);
        _context.SocialLinks.Add(link);
        await _context.SaveChangesAsync(ct);

        return new SocialLinkDto(link.Id, link.Platform, link.Url.Value, link.DisplayOrder);
    }
}



public class AddSocialLinkCommandValidator : AbstractValidator<AddSocialLinkCommand>
{
    public AddSocialLinkCommandValidator()
    {
        RuleFor(x => x.Platform)
            .NotEmpty().WithMessage("Platform is required.")
            .MaximumLength(50).WithMessage("Platform cannot exceed 50 characters.");

        RuleFor(x => x.Url)
            .NotEmpty().WithMessage("URL is required.")
            .MaximumLength(Url.MaxLength).WithMessage($"URL cannot exceed {Url.MaxLength} characters.")
            .Must(BeAValidHttpUrl).WithMessage("URL must be a valid HTTP or HTTPS URL.");

        RuleFor(x => x.DisplayOrder)
            .GreaterThanOrEqualTo(0).WithMessage("Display order cannot be negative.")
            .When(x => x.DisplayOrder.HasValue);
    }

    private static bool BeAValidHttpUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult) &&
               (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}

