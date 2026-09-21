using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Posts.Common;
using Showcase.Application.Features.Posts.Queries.GetProfilePosts;

namespace Showcase.Api.Endpoints.Profiles;

public class GetProfilePosts : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/profiles/{username}/posts", async (
            string username,
            int? pageNumber,
            int? pageSize,
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetProfilePostsQuery(username, pageNumber ?? 1, pageSize ?? 12);
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Profiles")
        .WithName(nameof(GetProfilePosts))
        .Produces<PaginatedList<PostSummaryResponse>>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .AllowAnonymous();
    }
}
