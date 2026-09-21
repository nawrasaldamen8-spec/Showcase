using System;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.SocialLinks.Commands.UpdateSocialLink;

namespace Showcase.Api.Endpoints.SocialLinks;

public record UpdateSocialLinkRequest(string Platform, string Url);

public class UpdateSocialLink : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/profiles/me/social-links/{id:guid}", async (
            Guid id,
            UpdateSocialLinkRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new UpdateSocialLinkCommand(id, request.Platform, request.Url);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("SocialLinks")
        .WithName(nameof(UpdateSocialLink))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}
