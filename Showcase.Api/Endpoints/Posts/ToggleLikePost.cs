using System;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Posts.Commands.ToggleLikePost;

namespace Showcase.Api.Endpoints.Posts;

public record ToggleLikeRequest(bool? DesiredState);

public class ToggleLikePost : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/posts/{postId:guid}/like", async (
            Guid postId,
            [FromBody] ToggleLikeRequest? body,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new ToggleLikePostCommand(postId, body?.DesiredState);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Posts")
        .WithName(nameof(ToggleLikePost))
        .Produces<ToggleLikePostResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}
