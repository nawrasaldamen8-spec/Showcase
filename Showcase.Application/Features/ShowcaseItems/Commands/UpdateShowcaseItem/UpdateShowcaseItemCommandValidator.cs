using FluentValidation;
namespace Showcase.Application.Features.ShowcaseItems.Commands.UpdateShowcaseItem;

public class UpdateShowcaseItemCommandValidator : AbstractValidator<UpdateShowcaseItemCommand>
{
    public UpdateShowcaseItemCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(2000);
    }
}
