using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Application.Features.Posts.Commands;

namespace Showcase.Api.Endpoints.Posts;

public record UpdatePostRequest(
    string Title,
    string Description = "",
    string? ExternalUrl = null,
    System.Collections.Generic.IReadOnlyList<string>? Tags = null);

public class UpdatePost : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/posts/{id:guid}", async (
            Guid id,
            UpdatePostRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new UpdatePostCommand(id, request.Title, request.Description, request.ExternalUrl, request.Tags);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Posts")
        .WithName(nameof(UpdatePost))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}

