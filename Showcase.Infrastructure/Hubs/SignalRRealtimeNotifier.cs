using Microsoft.AspNetCore.SignalR;

namespace Showcase.Infrastructure.Hubs;

public class SignalRRealtimeNotifier(IHubContext<NotificationHub> hubContext) : IRealtimeNotifier
{
    private readonly IHubContext<NotificationHub> _hubContext = hubContext;

    public async Task PublishToUserAsync(string userId, string title, string message, object? payload = null, CancellationToken ct = default)
    {
        var data = new
        {
            title,
            message,
            payload
        };

        await _hubContext.Clients.User(userId).SendAsync("NotificationReceived", data, ct);
        await _hubContext.Clients.Group($"user_{userId}").SendAsync("NotificationReceived", data, ct);
    }
}
