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
using Showcase.Domain.Enums;

namespace Showcase.Application.Features.Admin.Reports;

public record GetContentReportsQuery(string? Status = null) : IRequest<Result<IReadOnlyList<ContentReportItemDto>>>;

public class GetContentReportsQueryHandler : IRequestHandler<GetContentReportsQuery, Result<IReadOnlyList<ContentReportItemDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public GetContentReportsQueryHandler(
        IApplicationDbContext context,
        IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<Result<IReadOnlyList<ContentReportItemDto>>> Handle(GetContentReportsQuery request, CancellationToken ct)
    {
        var query = _context.ContentReports.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Status) &&
            Enum.TryParse<ReportStatus>(request.Status, true, out var parsedStatus))
        {
            query = query.Where(r => r.Status == parsedStatus);
        }

        var reports = await query
            .OrderByDescending(r => r.CreatedAtUtc)
            .Take(100)
            .ToListAsync(ct);

        var reporterIds = reports.Select(r => r.ReporterUserId).Distinct().ToList();
        var usersResult = await _identityService.GetUsersByIdsAsync(reporterIds, ct);
        var usersDict = usersResult.IsSuccess ? usersResult.Value : new Dictionary<string, UserIdentityDetails>();

        var dtos = reports.Select(r => new ContentReportItemDto(
            r.Id,
            r.ReporterUserId,
            usersDict.TryGetValue(r.ReporterUserId, out var u) ? u.UserName : "Unknown",
            r.TargetType,
            r.TargetId,
            r.TargetLabel,
            r.Reason,
            r.TargetLabel, // Details
            r.Status.ToString().ToLowerInvariant(),
            r.ActionTaken,
            r.CreatedAtUtc
        )).ToList();

        return Result.Success<IReadOnlyList<ContentReportItemDto>>(dtos);
    }
}
