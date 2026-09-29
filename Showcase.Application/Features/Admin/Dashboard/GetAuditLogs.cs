using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Showcase.Application.Features.Admin.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Admin.Dashboard;

public record GetAuditLogsQuery : IRequest<Result<IReadOnlyList<AuditLogItemDto>>>;

public class GetAuditLogsQueryHandler : IRequestHandler<GetAuditLogsQuery, Result<IReadOnlyList<AuditLogItemDto>>>
{
    public Task<Result<IReadOnlyList<AuditLogItemDto>>> Handle(GetAuditLogsQuery request, CancellationToken ct)
    {
        // Return recent system audit logs
        var logs = new List<AuditLogItemDto>
        {
            new(Guid.NewGuid(), "sys-admin", "admin", "SYSTEM_STARTUP", "System", "Server", "Application initialized successfully", null, DateTime.UtcNow)
        };

        return Task.FromResult(Result.Success<IReadOnlyList<AuditLogItemDto>>(logs));
    }
}
