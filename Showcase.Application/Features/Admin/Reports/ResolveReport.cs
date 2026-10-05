namespace Showcase.Application.Features.Admin.Reports;

public record ResolveReportCommand(
    Guid ReportId,
    string ActionTaken) : IRequest<Result>;

public class ResolveReportCommandValidator : AbstractValidator<ResolveReportCommand>
{
    public ResolveReportCommandValidator()
    {
        RuleFor(x => x.ReportId)
            .NotEmpty().WithMessage("Report ID is required.");

        RuleFor(x => x.ActionTaken)
            .NotEmpty().WithMessage("Action taken is required.")
            .MaximumLength(500).WithMessage("Action taken cannot exceed 500 characters.");
    }
}

public class ResolveReportCommandHandler(
    IApplicationDbContext context,
    IPublisher publisher,
    IAuditLogger auditLogger) : IRequestHandler<ResolveReportCommand, Result>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IPublisher _publisher = publisher;
    private readonly IAuditLogger _auditLogger = auditLogger;

    public async Task<Result> Handle(ResolveReportCommand request, CancellationToken ct)
    {
        var report = await _context.ContentReports
            .FirstOrDefaultAsync(r => r.Id == request.ReportId, ct);

        if (report is null)
        {
            return ContentReportErrors.NotFound(request.ReportId);
        }

        var resolveResult = report.Resolve(request.ActionTaken);
        if (resolveResult.IsFailure)
        {
            return resolveResult;
        }

        await _context.SaveChangesAsync(ct);

        await _publisher.Publish(new Showcase.Application.Features.Notifications.Events.ContentReportResolvedNotificationEvent(
            report.Id,
            report.TargetType,
            report.TargetId,
            report.TargetLabel,
            request.ActionTaken), ct);

        await _auditLogger.LogAsync(
            "REPORT_RESOLVED",
            "ContentReport",
            request.ReportId.ToString(),
            $"{report.TargetType}:{report.TargetLabel}",
            request.ActionTaken,
            ct: ct);

        return Result.Success();
    }
}
