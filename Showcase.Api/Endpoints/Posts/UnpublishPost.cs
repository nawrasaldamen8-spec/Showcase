using System;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Posts.Commands.UnpublishPost;

namespace Showcase.Api.Endpoints.Posts;

public class UnpublishPost : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/posts/{id:guid}/unpublish", async (
            Guid id,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new UnpublishPostCommand(id), ct);
            return result.ToResponse();
        })
        .WithTags("Posts")
        .WithName(nameof(UnpublishPost))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}
