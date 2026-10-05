namespace Showcase.Domain.Entities;

public class AuditLog : BaseEntity
{
    public string AdminUserId { get; private set; } = string.Empty;
    public string AdminUsername { get; private set; } = string.Empty;
    public string Action { get; private set; } = string.Empty;
    public string TargetEntity { get; private set; } = string.Empty;
    public string TargetId { get; private set; } = string.Empty;
    public string TargetLabel { get; private set; } = string.Empty;
    public string? Reason { get; private set; }
    public string? MetadataJson { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private AuditLog() { } // EF Core

    public AuditLog(
        string adminUserId,
        string adminUsername,
        string action,
        string targetEntity,
        string targetId,
        string targetLabel,
        string? reason = null,
        string? metadataJson = null)
    {
        if (string.IsNullOrWhiteSpace(adminUserId))
            throw new ArgumentException("AdminUserId is required.", nameof(adminUserId));

        if (string.IsNullOrWhiteSpace(action))
            throw new ArgumentException("Action is required.", nameof(action));

        AdminUserId = adminUserId;
        AdminUsername = string.IsNullOrWhiteSpace(adminUsername) ? "admin" : adminUsername.Trim();
        Action = action.Trim().ToUpperInvariant();
        TargetEntity = string.IsNullOrWhiteSpace(targetEntity) ? "System" : targetEntity.Trim();
        TargetId = targetId?.Trim() ?? string.Empty;
        TargetLabel = string.IsNullOrWhiteSpace(targetLabel) ? targetId ?? string.Empty : targetLabel.Trim();
        Reason = string.IsNullOrWhiteSpace(reason) ? null : reason.Trim();
        MetadataJson = string.IsNullOrWhiteSpace(metadataJson) ? null : metadataJson.Trim();
        CreatedAt = DateTime.UtcNow;
    }
}
