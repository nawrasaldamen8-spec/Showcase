using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Showcase.Application.Common.Interfaces;

namespace Showcase.Infrastructure.Hubs;

public class SignalRRealtimeNotifier : IRealtimeNotifier
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public SignalRRealtimeNotifier(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task PublishToUserAsync(string userId, string title, string message, object? payload = null, CancellationToken ct = default)
    {
        await _hubContext.Clients.Group($"user_{userId}").SendAsync("NotificationReceived", new
        {
            title,
            message,
            payload
        }, ct);
    }

    public async Task BroadcastAsync(string title, string message, string severity, CancellationToken ct = default)
    {
        await _hubContext.Clients.All.SendAsync("BroadcastReceived", new
        {
            title,
            message,
            severity
        }, ct);
    }
}
