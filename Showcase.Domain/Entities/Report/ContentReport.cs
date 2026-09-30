using System;
using Showcase.Domain.Common.BaseEntity;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Enums;

namespace Showcase.Domain.Entities;

public class ContentReport : BaseEntity
{
    public string ReporterUserId { get; private set; } = string.Empty;
    public string TargetType { get; private set; } = string.Empty;
    public string TargetId { get; private set; } = string.Empty;
    public string TargetLabel { get; private set; } = string.Empty;
    public string Reason { get; private set; } = string.Empty;
    public ReportStatus Status { get; private set; }
    public string? ActionTaken { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime? ResolvedAtUtc { get; private set; }

    private ContentReport() { } // EF Core

    public ContentReport(
        string reporterUserId,
        string targetType,
        string targetId,
        string targetLabel,
        string reason)
    {
        if (string.IsNullOrWhiteSpace(reporterUserId))
            throw new ArgumentException("ReporterUserId is required.", nameof(reporterUserId));

        if (string.IsNullOrWhiteSpace(targetType))
            throw new ArgumentException("TargetType is required.", nameof(targetType));

        if (string.IsNullOrWhiteSpace(targetId))
            throw new ArgumentException("TargetId is required.", nameof(targetId));

        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Reason is required.", nameof(reason));

        ReporterUserId = reporterUserId.Trim();
        TargetType = targetType.Trim();
        TargetId = targetId.Trim();
        TargetLabel = string.IsNullOrWhiteSpace(targetLabel) ? targetId.Trim() : targetLabel.Trim();
        Reason = reason.Trim();
        Status = ReportStatus.Pending;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public Result Resolve(string actionTaken)
    {
        if (Status != ReportStatus.Pending)
            return ContentReportErrors.NotPending;

        Status = ReportStatus.Resolved;
        ActionTaken = string.IsNullOrWhiteSpace(actionTaken) ? "Resolved" : actionTaken.Trim();
        ResolvedAtUtc = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Dismiss()
    {
        if (Status != ReportStatus.Pending)
            return ContentReportErrors.NotPending;

        Status = ReportStatus.Dismissed;
        ActionTaken = "Dismissed without action";
        ResolvedAtUtc = DateTime.UtcNow;
        return Result.Success();
    }
}
