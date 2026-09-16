using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.ShowcaseItems.Commands.CreateShowcaseItem;
using System.Threading;

namespace Showcase.Api.Endpoints.ShowcaseItems;

public class CreateShowcaseItem : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/admin/showcase", async (CreateShowcaseItemCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("ShowcaseItems")
        .WithName(nameof(CreateShowcaseItem));
    }
}
