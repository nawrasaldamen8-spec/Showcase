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

    public ResolveReportCommandHandler(IApplicationDbContext context)
    {
        _context = context;
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

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}
