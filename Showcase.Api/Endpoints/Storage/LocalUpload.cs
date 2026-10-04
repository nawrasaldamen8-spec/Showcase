using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Storage.Commands.UploadLocalFile;

namespace Showcase.Api.Endpoints.Storage;

public class LocalUpload : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/v1/storage/local-upload", async (
            string key,
            HttpRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new UploadLocalFileCommand(key, request.Body), ct);
            return result.ToResponse();
        })
        .WithTags("Storage")
        .WithName(nameof(LocalUpload))
        .Produces<UploadLocalFileResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .RequireRateLimiting("upload-policy")
        .AllowAnonymous();
    }
}
