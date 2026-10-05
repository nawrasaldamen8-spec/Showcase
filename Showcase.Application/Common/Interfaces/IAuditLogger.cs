namespace Showcase.Application.Common.Interfaces;

public interface IAuditLogger
{
    Task LogAsync(
        string action,
        string targetEntity,
        string targetId,
        string targetLabel,
        string? reason = null,
        string? metadataJson = null,
        CancellationToken ct = default);

    Task LogExplicitAsync(
        string adminUserId,
        string adminUsername,
        string action,
        string targetEntity,
        string targetId,
        string targetLabel,
        string? reason = null,
        string? metadataJson = null,
        CancellationToken ct = default);
}
