using FluentValidation;

namespace Showcase.Application.Features.Posts.Commands.ReorderPostImages;

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
