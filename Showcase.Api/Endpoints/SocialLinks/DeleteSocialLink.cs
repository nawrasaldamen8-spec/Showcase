using System;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.SocialLinks.Commands.DeleteSocialLink;

namespace Showcase.Api.Endpoints.SocialLinks;

public class DeleteSocialLink : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("api/profiles/me/social-links/{id:guid}", async (
            Guid id,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new DeleteSocialLinkCommand(id), ct);
            return result.ToResponse();
        })
        .WithTags("SocialLinks")
        .WithName(nameof(DeleteSocialLink))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}
