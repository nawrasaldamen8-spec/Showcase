using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.SocialLinks.Commands.ReorderSocialLinks;

namespace Showcase.Api.Endpoints.SocialLinks;

public class ReorderSocialLinks : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/profiles/me/social-links/reorder", async (
            ReorderSocialLinksCommand command,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("SocialLinks")
        .WithName(nameof(ReorderSocialLinks))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}
