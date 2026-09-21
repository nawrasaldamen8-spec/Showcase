using System;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Posts.Commands.GetPostImageUploadUrl;
using Showcase.Application.Features.Posts.Common;

namespace Showcase.Api.Endpoints.Posts;

public record GetPostImageUploadUrlRequest(string ContentType, long FileSizeBytes);

public class GetPostImageUploadUrl : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/posts/{id:guid}/images/upload-url", async (
            Guid id,
            GetPostImageUploadUrlRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new GetPostImageUploadUrlCommand(id, request.ContentType, request.FileSizeBytes);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Posts")
        .WithName(nameof(GetPostImageUploadUrl))
        .Produces<PostImageUploadUrlResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .ProducesProblem(StatusCodes.Status429TooManyRequests)
        .RequireAuthorization()
        .RequireRateLimiting("upload-policy");
    }
}
