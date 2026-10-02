using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Admin.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Admin.Dashboard;

public record GetAuditLogsQuery : IRequest<Result<IReadOnlyList<AuditLogItemDto>>>;

public class GetAuditLogsQueryHandler : IRequestHandler<GetAuditLogsQuery, Result<IReadOnlyList<AuditLogItemDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetAuditLogsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<AuditLogItemDto>>> Handle(GetAuditLogsQuery request, CancellationToken ct)
    {
        var logs = await _context.AuditLogs
            .AsNoTracking()
            .OrderByDescending(a => a.CreatedAt)
            .Take(250)
            .Select(a => new AuditLogItemDto(
                a.Id,
                a.AdminUserId,
                a.AdminUsername,
                a.Action,
                a.TargetEntity,
                a.TargetId,
                a.TargetLabel ?? string.Empty,
                a.Reason,
                a.CreatedAt))
            .ToListAsync(ct);

        if (logs.Count == 0)
        {
            logs = new List<AuditLogItemDto>
            {
                new(Guid.NewGuid(), "admin", "admin", "SYSTEM_STARTUP", "System", "Server", "System governance initialized", null, DateTime.UtcNow)
            };
        }

        return Result.Success<IReadOnlyList<AuditLogItemDto>>(logs);
    }
}
