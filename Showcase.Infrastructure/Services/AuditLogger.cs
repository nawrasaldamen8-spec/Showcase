namespace Showcase.Infrastructure.Services;

public class AuditLogger(
    IApplicationDbContext context,
    ICurrentUserService currentUserService,
    ILogger<AuditLogger> logger) : IAuditLogger
{
    private readonly IApplicationDbContext _context = context;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly ILogger<AuditLogger> _logger = logger;

    public Task LogAsync(
        string action,
        string targetEntity,
        string targetId,
        string targetLabel,
        string? reason = null,
        string? metadataJson = null,
        CancellationToken ct = default)
    {
        var adminUserId = _currentUserService.UserId ?? "admin-system";
        var adminUsername = _currentUserService.Username ?? "admin";

        return LogExplicitAsync(adminUserId, adminUsername, action, targetEntity, targetId, targetLabel, reason, metadataJson, ct);
    }

    public async Task LogExplicitAsync(
        string adminUserId,
        string adminUsername,
        string action,
        string targetEntity,
        string targetId,
        string targetLabel,
        string? reason = null,
        string? metadataJson = null,
        CancellationToken ct = default)
    {
        try
        {
            var auditEntry = new AuditLog(
                adminUserId,
                adminUsername,
                action,
                targetEntity,
                targetId,
                targetLabel,
                reason,
                metadataJson);

            await _context.AuditLogs.AddAsync(auditEntry, ct);
            await _context.SaveChangesAsync(ct);

            _logger.LogInformation(
                "AuditLog recorded: [{Action}] by @{Admin} on {Entity} ({Label}). Reason: {Reason}",
                action,
                adminUsername,
                targetEntity,
                targetLabel,
                reason ?? "None");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to record audit log for action {Action}", action);
        }
    }
}
