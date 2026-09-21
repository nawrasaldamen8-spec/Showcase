using MediatR;
using Showcase.Application.Features.Posts.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Enums;

namespace Showcase.Application.Features.Posts.Queries.GetMyPosts;

public record GetMyPostsQuery(
    PostStatus? Status = null,
    int PageNumber = 1,
    int PageSize = 10) : IRequest<Result<PaginatedList<PostSummaryResponse>>>;
