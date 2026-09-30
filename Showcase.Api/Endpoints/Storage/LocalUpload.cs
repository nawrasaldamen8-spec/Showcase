using System;
using System.IO;
using System.Threading;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Showcase.Api.Endpoints.Storage;

public class LocalUpload : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/v1/storage/local-upload", async (
            string key,
            HttpRequest request,
            IWebHostEnvironment env,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(key))
            {
                return Results.BadRequest(new { error = "Storage key is required." });
            }

            // Path traversal protection
            var normalizedKey = key.Trim().Replace('\\', '/').TrimStart('/');
            if (normalizedKey.Contains(".."))
            {
                return Results.BadRequest(new { error = "Invalid storage key." });
            }

            var contentRoot = env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadDirectory = Path.Combine(contentRoot, "uploads");
            var targetFilePath = Path.Combine(uploadDirectory, normalizedKey);

            var fileDirectory = Path.GetDirectoryName(targetFilePath);
            if (!string.IsNullOrEmpty(fileDirectory) && !Directory.Exists(fileDirectory))
            {
                Directory.CreateDirectory(fileDirectory);
            }

            await using var fileStream = new FileStream(targetFilePath, FileMode.Create, FileAccess.Write, FileShare.None);
            await request.Body.CopyToAsync(fileStream, ct);

            return Results.Ok(new { success = true, key = normalizedKey });
        })
        .WithTags("Storage")
        .WithName(nameof(LocalUpload))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .RequireRateLimiting("upload-policy")
        .AllowAnonymous();
    }
}
