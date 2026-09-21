using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Profiles.Commands.RemoveAvatar;

namespace Showcase.Api.Endpoints.Profiles;

public class RemoveAvatar : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("api/profiles/me/avatar", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new RemoveAvatarCommand(), ct);
            return result.ToResponse();
        })
        .WithTags("Profiles")
        .WithName(nameof(RemoveAvatar))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}
