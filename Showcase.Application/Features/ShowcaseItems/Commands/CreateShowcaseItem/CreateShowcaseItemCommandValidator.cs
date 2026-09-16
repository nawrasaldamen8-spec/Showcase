using FluentValidation;
namespace Showcase.Application.Features.ShowcaseItems.Commands.CreateShowcaseItem;

public class CreateShowcaseItemCommandValidator : AbstractValidator<CreateShowcaseItemCommand>
{
    public CreateShowcaseItemCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(2000);
    }
}
