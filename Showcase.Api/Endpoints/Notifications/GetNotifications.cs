using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Application.Features.Notifications.Queries;
using Showcase.Application.Features.Notifications.Common;

namespace Showcase.Api.Endpoints.Notifications;

public class GetNotifications : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/notifications", async (
            int? pageNumber,
            int? pageSize,
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetNotificationsQuery(pageNumber ?? 1, pageSize ?? 20);
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Notifications")
        .WithName(nameof(GetNotifications))
        .Produces<PaginatedList<NotificationDto>>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}
