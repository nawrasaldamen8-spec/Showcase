using FluentValidation;
using Showcase.Domain.ValueObjects;

namespace Showcase.Application.Features.Profiles.Commands.UpdateProfile;

public class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(150).WithMessage("Name cannot exceed 150 characters.");

        RuleFor(x => x.Specialty)
            .MaximumLength(100).WithMessage("Specialty cannot exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.Specialty));

        RuleFor(x => x.Country)
            .MaximumLength(100).WithMessage("Country cannot exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.Country));

        RuleFor(x => x.Bio)
            .MaximumLength(Bio.MaxLength).WithMessage($"Bio cannot exceed {Bio.MaxLength} characters.")
            .When(x => !string.IsNullOrEmpty(x.Bio));
    }
}
