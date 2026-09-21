using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Posts.Common;
using Showcase.Application.Features.Posts.Queries.GetMyPosts;
using Showcase.Domain.Enums;

namespace Showcase.Api.Endpoints.Posts;

public class GetMyPosts : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/posts/mine", async (
            PostStatus? status,
            int? pageNumber,
            int? pageSize,
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetMyPostsQuery(status, pageNumber ?? 1, pageSize ?? 10);
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Posts")
        .WithName(nameof(GetMyPosts))
        .Produces<PaginatedList<PostSummaryResponse>>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}
