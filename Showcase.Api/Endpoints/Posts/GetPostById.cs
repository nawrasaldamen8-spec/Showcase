using System;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Posts.Common;
using Showcase.Application.Features.Posts.Queries.GetPostById;

namespace Showcase.Api.Endpoints.Posts;

public class GetPostById : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/posts/{id:guid}", async (
            Guid id,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new GetPostByIdQuery(id), ct);
            return result.ToResponse();
        })
        .WithTags("Posts")
        .WithName(nameof(GetPostById))
        .Produces<PostResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .AllowAnonymous();
    }
}
