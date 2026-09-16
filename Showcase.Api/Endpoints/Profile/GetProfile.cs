using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Profile.Queries.GetPublicProfile;
using System.Threading;

namespace Showcase.Api.Endpoints.Profile;

public class GetProfile : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/profile", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetPublicProfileQuery(), ct);
            return result.ToResponse();
        })
        .WithTags("Profile")
        .WithName(nameof(GetProfile));
    }
}
