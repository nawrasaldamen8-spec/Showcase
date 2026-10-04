using System;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Notifications.Commands;

namespace Showcase.Api.Endpoints.Notifications;

public class MarkNotificationAsRead : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/notifications/{id:guid}/read", async (
            Guid id,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new MarkNotificationAsReadCommand(id);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Notifications")
        .WithName(nameof(MarkNotificationAsRead))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}
