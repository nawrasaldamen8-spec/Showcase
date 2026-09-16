using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.SocialLinks.Commands.CreateSocialLink;
using System.Threading;

namespace Showcase.Api.Endpoints.SocialLinks;

public class CreateSocialLink : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/admin/social-links", async (CreateSocialLinkCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("SocialLinks")
        .WithName(nameof(CreateSocialLink));
    }
}
