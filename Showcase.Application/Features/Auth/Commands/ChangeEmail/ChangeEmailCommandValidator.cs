using FluentValidation;

namespace Showcase.Application.Features.Auth.Commands.ChangeEmail;

public class ChangeEmailCommandValidator : AbstractValidator<ChangeEmailCommand>
{
    public ChangeEmailCommandValidator()
    {
        RuleFor(x => x.NewEmail)
            .NotEmpty().WithMessage("New email is required.")
            .EmailAddress().WithMessage("New email must be a valid email address.")
            .MaximumLength(256).WithMessage("Email cannot exceed 256 characters.");

        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("Current password is required.");
    }
}
