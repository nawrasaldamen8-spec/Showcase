using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.ShowcaseItems.Commands.DeleteShowcaseItem;
using System;
using System.Threading;

namespace Showcase.Api.Endpoints.ShowcaseItems;

public class DeleteShowcaseItem : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("api/admin/showcase/{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new DeleteShowcaseItemCommand(id), ct);
            return result.ToResponse();
        })
        .WithTags("ShowcaseItems")
        .WithName(nameof(DeleteShowcaseItem));
    }
}
