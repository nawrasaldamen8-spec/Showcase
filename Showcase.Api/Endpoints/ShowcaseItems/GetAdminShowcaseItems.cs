using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.ShowcaseItems.Queries.GetShowcaseItems;
using System.Threading;

namespace Showcase.Api.Endpoints.ShowcaseItems;

public class GetAdminShowcaseItems : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/admin/showcase", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetShowcaseItemsQuery(), ct);
            return result.ToResponse();
        })
        .WithTags("ShowcaseItems")
        .WithName(nameof(GetAdminShowcaseItems));
    }
}
