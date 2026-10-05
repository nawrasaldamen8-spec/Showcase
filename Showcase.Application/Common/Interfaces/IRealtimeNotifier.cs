namespace Showcase.Application.Common.Interfaces;

public interface IRealtimeNotifier
{
    Task PublishToUserAsync(string userId, string title, string message, object? payload = null, CancellationToken ct = default);
}
