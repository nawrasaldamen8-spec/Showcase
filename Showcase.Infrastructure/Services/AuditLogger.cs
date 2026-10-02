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
    private readonly ILogger<AuditLogger> _logger;

    public AuditLogger(
        IApplicationDbContext context,
        ILogger<AuditLogger> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task LogAsync(
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
