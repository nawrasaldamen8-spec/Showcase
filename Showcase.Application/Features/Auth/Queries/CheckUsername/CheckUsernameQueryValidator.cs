using FluentValidation;

namespace Showcase.Application.Features.Auth.Queries.CheckUsername;

public class CheckUsernameQueryValidator : AbstractValidator<CheckUsernameQuery>
{
    public CheckUsernameQueryValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required.")
            .MinimumLength(3).WithMessage("Username must be at least 3 characters.")
            .MaximumLength(50).WithMessage("Username must not exceed 50 characters.")
            .Matches(@"^[a-zA-Z0-9_]+$").WithMessage("Username can only contain alphanumeric characters and underscores.");
    }
}
