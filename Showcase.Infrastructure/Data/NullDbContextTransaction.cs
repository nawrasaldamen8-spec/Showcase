namespace Showcase.Infrastructure.Data;

/// <summary>
/// A no-op implementation of IDbContextTransaction for non-relational test environments (e.g. EF Core InMemory).
/// </summary>
public sealed class NullDbContextTransaction : IDbContextTransaction
{
    public Guid TransactionId { get; } = Guid.NewGuid();

    public void Commit() { }

    public Task CommitAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;

    public void Rollback() { }

    public Task RollbackAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;

    public void Dispose() { }

    public ValueTask DisposeAsync() => ValueTask.CompletedTask;
}
