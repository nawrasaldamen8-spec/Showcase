using FluentValidation;

namespace Showcase.Application.Features.Posts.Queries.GetExplorePosts;

public class GetExplorePostsQueryValidator : AbstractValidator<GetExplorePostsQuery>
{
    public GetExplorePostsQueryValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1).WithMessage("Page number must be at least 1.");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 50).WithMessage("Page size must be between 1 and 50.");

        RuleFor(x => x.Search)
            .MaximumLength(100).WithMessage("Search query cannot exceed 100 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Search));
    }
}
