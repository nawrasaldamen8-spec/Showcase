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

public class DismissReportCommandHandler(
    IApplicationDbContext context,
    IAuditLogger auditLogger) : IRequestHandler<DismissReportCommand, Result>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IAuditLogger _auditLogger = auditLogger;

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
            "REPORT_DISMISSED",
            "ContentReport",
            request.ReportId.ToString(),
            $"{report.TargetType}:{report.TargetLabel}",
            "Report dismissed without action",
            ct: ct);

        return Result.Success();
    }
}
