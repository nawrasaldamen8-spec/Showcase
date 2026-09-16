using FluentValidation;
namespace Showcase.Application.Features.Profile.Commands.UpdateProfile;

public class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Title).MaximumLength(200);
        RuleFor(x => x.Bio).MaximumLength(2000);
        RuleFor(x => x.Location).MaximumLength(200);
    }
}
