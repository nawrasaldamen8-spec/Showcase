using FluentValidation;

namespace Showcase.Application.Features.SocialLinks.Commands.CreateSocialLink;

public class CreateSocialLinkCommandValidator : AbstractValidator<CreateSocialLinkCommand>
{
    public CreateSocialLinkCommandValidator()
    {
        RuleFor(x => x.ProfileId)
            .NotEmpty().WithMessage("ProfileId is required.");

        RuleFor(x => x.Platform)
            .IsInEnum().WithMessage("A valid platform must be specified.");

        RuleFor(x => x.LinkUrl)
            .NotEmpty().WithMessage("Link URL is required.")
            .MaximumLength(500).WithMessage("Link URL must not exceed 500 characters.");

        RuleFor(x => x.DisplayOrder)
            .GreaterThanOrEqualTo(0).WithMessage("Display order must be non-negative.");
    }
}
