using MediatR;
using Showcase.Application.Features.Posts.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Posts.Queries.GetProfilePosts;

public record GetProfilePostsQuery(
    string Username,
    int PageNumber = 1,
    int PageSize = 12) : IRequest<Result<PaginatedList<PostSummaryResponse>>>;
