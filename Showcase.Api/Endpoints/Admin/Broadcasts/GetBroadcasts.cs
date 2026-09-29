using System.Collections.Generic;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Admin.Broadcasts;
using Showcase.Application.Features.Admin.Common;

namespace Showcase.Api.Endpoints.Admin.Broadcasts;

public class GetBroadcasts : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/admin/broadcasts", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetBroadcastsQuery();
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Admin - Broadcasts")
        .WithName(nameof(GetBroadcasts))
        .Produces<IReadOnlyList<BroadcastAnnouncementItemDto>>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .RequireAuthorization(policy => policy.RequireRole("Admin"));
    }
}
