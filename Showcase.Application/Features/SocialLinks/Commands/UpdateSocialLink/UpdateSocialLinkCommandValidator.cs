using FluentValidation;

namespace Showcase.Application.Features.SocialLinks.Commands.UpdateSocialLink;

public class UpdateSocialLinkCommandValidator : AbstractValidator<UpdateSocialLinkCommand>
{
    public UpdateSocialLinkCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Id is required.");

        RuleFor(x => x.Platform)
            .IsInEnum().WithMessage("A valid platform must be specified.");

        RuleFor(x => x.LinkUrl)
            .NotEmpty().WithMessage("Link URL is required.")
            .MaximumLength(500).WithMessage("Link URL must not exceed 500 characters.");

        RuleFor(x => x.DisplayOrder)
            .GreaterThanOrEqualTo(0).WithMessage("Display order must be non-negative.");
    }
}
