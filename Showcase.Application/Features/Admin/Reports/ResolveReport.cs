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

public class ResolveReportCommandHandler : IRequestHandler<ResolveReportCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IAuditLogger _auditLogger;
    private readonly ICurrentUserService _currentUserService;

    public ResolveReportCommandHandler(
        IApplicationDbContext context,
        IAuditLogger auditLogger,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _auditLogger = auditLogger;
        _currentUserService = currentUserService;
    }

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

        // Determine target user to issue moderation warning notification
        string? targetUserId = null;
        Guid? sourcePostId = null;

        if (report.TargetType.Equals("POST", StringComparison.OrdinalIgnoreCase) ||
            report.TargetType.Equals("WORK", StringComparison.OrdinalIgnoreCase))
        {
            if (Guid.TryParse(report.TargetId, out var postId))
            {
                sourcePostId = postId;
                var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == postId, ct);
                if (post is not null)
                {
                    var profile = await _context.Profiles
                        .IgnoreQueryFilters()
                        .FirstOrDefaultAsync(p => p.Id == post.ProfileId, ct);
                    targetUserId = profile?.UserId;
                }
            }
        }
        else if (report.TargetType.Equals("USER", StringComparison.OrdinalIgnoreCase) ||
                 report.TargetType.Equals("PROFILE", StringComparison.OrdinalIgnoreCase))
        {
            targetUserId = report.TargetId;
        }

        if (!string.IsNullOrWhiteSpace(targetUserId))
        {
            var warningNotification = new Notification(
                targetUserId,
                Showcase.Domain.Enums.NotificationType.System,
                "Moderation Notice",
                $"Administrative review for '{report.TargetLabel}': {request.ActionTaken}",
                sourcePostId);

            _context.Notifications.Add(warningNotification);
        }

        await _context.SaveChangesAsync(ct);

        await _auditLogger.LogAsync(
            _currentUserService.UserId ?? "admin-system",
            _currentUserService.Username ?? "admin",
            "REPORT_RESOLVED",
            "ContentReport",
            request.ReportId.ToString(),
            $"{report.TargetType}:{report.TargetLabel}",
            request.ActionTaken,
            ct: ct);

        return Result.Success();
    }
}
