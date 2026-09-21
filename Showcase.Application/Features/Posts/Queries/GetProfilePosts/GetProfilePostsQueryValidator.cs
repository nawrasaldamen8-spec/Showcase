using FluentValidation;

namespace Showcase.Application.Features.Posts.Queries.GetProfilePosts;

public class GetProfilePostsQueryValidator : AbstractValidator<GetProfilePostsQuery>
{
    public GetProfilePostsQueryValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required.");

        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1).WithMessage("Page number must be at least 1.");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 50).WithMessage("Page size must be between 1 and 50.");
    }
}
