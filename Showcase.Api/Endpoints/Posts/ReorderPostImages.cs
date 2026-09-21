using System;
using System.Collections.Generic;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Posts.Commands.ReorderPostImages;

namespace Showcase.Api.Endpoints.Posts;

public record ReorderPostImagesRequest(IReadOnlyList<ReorderPostImageItem> Items);

public class ReorderPostImages : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/posts/{id:guid}/images/reorder", async (
            Guid id,
            ReorderPostImagesRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new ReorderPostImagesCommand(id, request.Items);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Posts")
        .WithName(nameof(ReorderPostImages))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}
