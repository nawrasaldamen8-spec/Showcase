using Showcase.Application.Features.Posts.Common;

namespace Showcase.Application.Features.Posts.Queries;



public record GetExplorePostsQuery(
    string? Search = null,
    int PageNumber = 1,
    int PageSize = 12) : IRequest<Result<PaginatedList<PostSummaryResponse>>>, IPaginationRequest;



public class GetExplorePostsQueryHandler(
    IApplicationDbContext context,
    IIdentityService identityService,
    IStorageService storageService,
    ICurrentUserService currentUserService) : IRequestHandler<GetExplorePostsQuery, Result<PaginatedList<PostSummaryResponse>>>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IIdentityService _identityService = identityService;
    private readonly IStorageService _storageService = storageService;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<PaginatedList<PostSummaryResponse>>> Handle(GetExplorePostsQuery request, CancellationToken ct)
    {
        var visibleProfileIds = _context.GetExploreFeaturedCreatorIds();

        var pagedPosts = await _context.Posts
            .Include(p => p.Images)
            .Include(p => p.PostTags)
                .ThenInclude(pt => pt.Tag)
            .AsPublished()
            .Where(p => visibleProfileIds.Contains(p.ProfileId))
            .Search(request.Search)
            .OrderByDescending(p => p.PublishedAt)
            .ThenByDescending(p => p.Id)
            .ToPaginatedListAsync(request, ct);

        if (pagedPosts.TotalCount == 0)
        {
            return PaginatedList<PostSummaryResponse>.Empty(request.PageNumber, request.PageSize);
        }

        var profileIds = pagedPosts.Items.Select(p => p.ProfileId).Distinct().ToList();
        var postIds = pagedPosts.Items.Select(p => p.Id).ToList();

        var creators = await _context.GetPostCreatorsAsync(_identityService, _storageService, profileIds, ct);
        var likedPostIds = await _context.GetUserLikedPostIdsAsync(_currentUserService.UserId, postIds, ct);

        return pagedPosts.Map(post =>
        {
            creators.TryGetValue(post.ProfileId, out var creator);
            return post.ToSummaryResponse(_storageService, creator, likedPostIds.Contains(post.Id));
        });
    }
}



public class GetExplorePostsQueryValidator : AbstractValidator<GetExplorePostsQuery>
{
    public GetExplorePostsQueryValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1).WithMessage("Page number must be at least 1.");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100).WithMessage("Page size must be between 1 and 100.");

        RuleFor(x => x.Search)
            .MaximumLength(100).WithMessage("Search query cannot exceed 100 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Search));
    }
}

