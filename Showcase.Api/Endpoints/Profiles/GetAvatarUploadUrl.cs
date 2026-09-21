using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Profiles.Commands.GetAvatarUploadUrl;
using Showcase.Application.Features.Profiles.Common;

namespace Showcase.Api.Endpoints.Profiles;

public class GetAvatarUploadUrl : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/profiles/me/avatar/upload-url", async (
            GetAvatarUploadUrlCommand command,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Profiles")
        .WithName(nameof(GetAvatarUploadUrl))
        .Produces<AvatarUploadUrlResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}
