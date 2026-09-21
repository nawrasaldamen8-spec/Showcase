using System;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Posts.Commands.RemovePostImage;

namespace Showcase.Api.Endpoints.Posts;

public class RemovePostImage : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("api/posts/{id:guid}/images/{imageId:guid}", async (
            Guid id,
            Guid imageId,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new RemovePostImageCommand(id, imageId), ct);
            return result.ToResponse();
        })
        .WithTags("Posts")
        .WithName(nameof(RemovePostImage))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}
