using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.SocialLinks.Commands.DeleteSocialLink;
using System;
using System.Threading;

namespace Showcase.Api.Endpoints.SocialLinks;

public class DeleteSocialLink : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("api/admin/social-links/{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new DeleteSocialLinkCommand(id), ct);
            return result.ToResponse();
        })
        .WithTags("SocialLinks")
        .WithName(nameof(DeleteSocialLink));
    }
}
