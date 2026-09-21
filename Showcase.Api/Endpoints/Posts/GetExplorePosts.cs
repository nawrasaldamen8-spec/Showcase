using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Posts.Common;
using Showcase.Application.Features.Posts.Queries.GetExplorePosts;

namespace Showcase.Api.Endpoints.Posts;

public class GetExplorePosts : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/posts/explore", async (
            string? search,
            int? pageNumber,
            int? pageSize,
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetExplorePostsQuery(search, pageNumber ?? 1, pageSize ?? 12);
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Posts")
        .WithName(nameof(GetExplorePosts))
        .Produces<PaginatedList<PostSummaryResponse>>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .AllowAnonymous();
    }
}
