using FluentValidation;
using Showcase.Domain.ValueObjects;

namespace Showcase.Application.Features.Profiles.Commands.UpdateProfile;

public class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.")
            .MaximumLength(100).WithMessage("First name cannot exceed 100 characters.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required.")
            .MaximumLength(100).WithMessage("Last name cannot exceed 100 characters.");

        RuleFor(x => x.Bio)
            .MaximumLength(Bio.MaxLength).WithMessage($"Bio cannot exceed {Bio.MaxLength} characters.")
            .When(x => !string.IsNullOrEmpty(x.Bio));
    }
}
