using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Notifications.Queries;
using Showcase.Application.Features.Notifications.Common;

namespace Showcase.Api.Endpoints.Notifications;

public class GetUnreadNotificationsCount : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/notifications/unread-count", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new GetUnreadNotificationsCountQuery(), ct);
            return result.ToResponse();
        })
        .WithTags("Notifications")
        .WithName(nameof(GetUnreadNotificationsCount))
        .Produces<UnreadCountResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}
