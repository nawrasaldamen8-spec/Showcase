using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Application.Features.Notifications.Commands;

namespace Showcase.Api.Endpoints.Notifications;

public class MarkAllNotificationsAsRead : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/notifications/read-all", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new MarkAllNotificationsAsReadCommand();
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Notifications")
        .WithName(nameof(MarkAllNotificationsAsRead))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}
