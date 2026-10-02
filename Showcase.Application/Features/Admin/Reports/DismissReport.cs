using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Admin.Reports;

public record DismissReportCommand(Guid ReportId) : IRequest<Result>;

public class DismissReportCommandValidator : AbstractValidator<DismissReportCommand>
{
    public DismissReportCommandValidator()
    {
        RuleFor(x => x.ReportId)
            .NotEmpty().WithMessage("Report ID is required.");
    }
}

public class DismissReportCommandHandler : IRequestHandler<DismissReportCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IAuditLogger _auditLogger;
    private readonly ICurrentUserService _currentUserService;

    public DismissReportCommandHandler(
        IApplicationDbContext context,
        IAuditLogger auditLogger,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _auditLogger = auditLogger;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(DismissReportCommand request, CancellationToken ct)
    {
        var report = await _context.ContentReports
            .FirstOrDefaultAsync(r => r.Id == request.ReportId, ct);

        if (report is null)
        {
            return ContentReportErrors.NotFound(request.ReportId);
        }

        var dismissResult = report.Dismiss();
        if (dismissResult.IsFailure)
        {
            return dismissResult;
        }

        await _context.SaveChangesAsync(ct);

        await _auditLogger.LogAsync(
            _currentUserService.UserId ?? "admin-system",
            _currentUserService.Username ?? "admin",
            "REPORT_DISMISSED",
            "ContentReport",
            request.ReportId.ToString(),
            $"{report.TargetType}:{report.TargetLabel}",
            "Report dismissed without action",
            ct: ct);

        return Result.Success();
    }
}
