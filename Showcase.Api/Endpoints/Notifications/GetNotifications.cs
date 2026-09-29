using System.Collections.Generic;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Notifications;
using Showcase.Application.Features.Notifications.Common;

namespace Showcase.Api.Endpoints.Notifications;

public class GetNotifications : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/notifications", async (
            int? limit,
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetNotificationsQuery(limit ?? 50);
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Notifications")
        .WithName(nameof(GetNotifications))
        .Produces<IReadOnlyList<NotificationDto>>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}
