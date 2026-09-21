using System;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Posts.Commands.AddPostImage;
using Showcase.Application.Features.Posts.Common;

namespace Showcase.Api.Endpoints.Posts;

public record AddPostImageRequest(string StorageKey, int? DisplayOrder = null);

public class AddPostImage : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/posts/{id:guid}/images", async (
            Guid id,
            AddPostImageRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new AddPostImageCommand(id, request.StorageKey, request.DisplayOrder);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Posts")
        .WithName(nameof(AddPostImage))
        .Produces<PostImageDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}
