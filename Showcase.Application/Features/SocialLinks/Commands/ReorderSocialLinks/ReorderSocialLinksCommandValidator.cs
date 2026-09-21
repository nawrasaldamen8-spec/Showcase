using FluentValidation;

namespace Showcase.Application.Features.SocialLinks.Commands.ReorderSocialLinks;

public class ReorderSocialLinksCommandValidator : AbstractValidator<ReorderSocialLinksCommand>
{
    public ReorderSocialLinksCommandValidator()
    {
        RuleFor(x => x.Items)
            .NotNull().WithMessage("Items list is required.")
            .NotEmpty().WithMessage("At least one social link item must be provided.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.Id)
                .NotEmpty().WithMessage("Social link ID is required.");

            item.RuleFor(i => i.DisplayOrder)
                .GreaterThanOrEqualTo(0).WithMessage("Display order cannot be negative.");
        });
    }
}
