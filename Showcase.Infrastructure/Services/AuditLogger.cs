using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Entities;

namespace Showcase.Infrastructure.Services;

public class AuditLogger : IAuditLogger
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<AuditLogger> _logger;

    public AuditLogger(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<AuditLogger> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

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
