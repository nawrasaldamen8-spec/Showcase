using FluentValidation;

namespace Showcase.Application.Features.Auth.Commands.ChangeUsername;

public class ChangeUsernameCommandValidator : AbstractValidator<ChangeUsernameCommand>
{
    public ChangeUsernameCommandValidator()
    {
        RuleFor(x => x.NewUsername)
            .NotEmpty().WithMessage("New username is required.")
            .MinimumLength(3).WithMessage("New username must be at least 3 characters long.")
            .MaximumLength(30).WithMessage("New username cannot exceed 30 characters.")
            .Matches(@"^[a-zA-Z0-9_-]+$").WithMessage("New username can only contain letters, numbers, underscores, and dashes.");

        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("Current password is required.");
    }
}
