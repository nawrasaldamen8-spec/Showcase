using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Profiles.Commands.UpdateAvatar;

namespace Showcase.Api.Endpoints.Profiles;

public class UpdateAvatar : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/profiles/me/avatar", async (
            UpdateAvatarCommand command,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Profiles")
        .WithName(nameof(UpdateAvatar))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}
