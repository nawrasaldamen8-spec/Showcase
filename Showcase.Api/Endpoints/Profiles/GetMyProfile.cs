using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Profiles.Common;
using Showcase.Application.Features.Profiles.Queries.GetMyProfile;

namespace Showcase.Api.Endpoints.Profiles;

public class GetMyProfile : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/profiles/me", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new GetMyProfileQuery(), ct);
            return result.ToResponse();
        })
        .WithTags("Profiles")
        .WithName(nameof(GetMyProfile))
        .Produces<MyProfileResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}
