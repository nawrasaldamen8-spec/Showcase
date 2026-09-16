using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.ShowcaseItems.Commands.UpdateShowcaseItem;
using System;
using System.Threading;

namespace Showcase.Api.Endpoints.ShowcaseItems;

public class UpdateShowcaseItem : IEndpoint
{
    public record UpdateShowcaseItemRequest(string Title, string Description, string? ImageUrl, string? LinkUrl, int DisplayOrder, bool IsFeatured);

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/admin/showcase/{id:guid}", async (Guid id, UpdateShowcaseItemRequest req, ISender sender, CancellationToken ct) =>
        {
            var command = new UpdateShowcaseItemCommand(id, req.Title, req.Description, req.ImageUrl, req.LinkUrl, req.DisplayOrder, req.IsFeatured);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("ShowcaseItems")
        .WithName(nameof(UpdateShowcaseItem));
    }
}
