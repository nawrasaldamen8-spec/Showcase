using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Application.Features.Profiles.Common;
using Showcase.Application.Features.SocialLinks.Queries;

namespace Showcase.Api.Endpoints.SocialLinks;

public class GetSocialLinks : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/profiles/me/social-links", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetSocialLinksQuery();
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("SocialLinks")
        .WithName(nameof(GetSocialLinks))
        .Produces<IReadOnlyList<SocialLinkDto>>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}

