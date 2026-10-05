using Showcase.Application.Features.Admin.Common;

namespace Showcase.Application.Features.Admin.Dashboard;

public record GetAuditLogsQuery : IRequest<Result<IReadOnlyList<AuditLogItemDto>>>;

public class GetAuditLogsQueryHandler(IApplicationDbContext context) : IRequestHandler<GetAuditLogsQuery, Result<IReadOnlyList<AuditLogItemDto>>>
{
    private readonly IApplicationDbContext _context = context;

    public async Task<Result<IReadOnlyList<AuditLogItemDto>>> Handle(GetAuditLogsQuery request, CancellationToken ct)
    {
        var logs = await _context.AuditLogs
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

        return Result.Success<IReadOnlyList<AuditLogItemDto>>(logs);
    }
}
