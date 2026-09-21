using FluentValidation;

namespace Showcase.Application.Features.Profiles.Queries.GetPublicProfile;

public class GetPublicProfileQueryValidator : AbstractValidator<GetPublicProfileQuery>
{
    public GetPublicProfileQueryValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required.")
            .MaximumLength(50).WithMessage("Username cannot exceed 50 characters.");
    }
}
