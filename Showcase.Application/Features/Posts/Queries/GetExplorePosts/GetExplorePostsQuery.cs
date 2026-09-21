using MediatR;
using Showcase.Application.Features.Posts.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Posts.Queries.GetExplorePosts;

public record GetExplorePostsQuery(
    string? Search = null,
    int PageNumber = 1,
    int PageSize = 12) : IRequest<Result<PaginatedList<PostSummaryResponse>>>;
