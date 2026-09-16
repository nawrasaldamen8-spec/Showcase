using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.SocialLinks.Commands.UpdateSocialLink;
using Showcase.Domain.Enums;
using System;
using System.Threading;

namespace Showcase.Api.Endpoints.SocialLinks;

public class UpdateSocialLink : IEndpoint
{
    public record UpdateSocialLinkRequest(SocialPlatform Platform, string LinkUrl, int DisplayOrder);

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/admin/social-links/{id:guid}", async (Guid id, UpdateSocialLinkRequest req, ISender sender, CancellationToken ct) =>
        {
            var command = new UpdateSocialLinkCommand(id, req.Platform, req.LinkUrl, req.DisplayOrder);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("SocialLinks")
        .WithName(nameof(UpdateSocialLink));
    }
}
