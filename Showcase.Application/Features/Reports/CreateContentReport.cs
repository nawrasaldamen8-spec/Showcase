using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Reports;

public record CreateContentReportCommand(
    string TargetType,
    string TargetId,
    string TargetLabel,
    string Reason,
    string? Details = null) : IRequest<Result<Guid>>;

public class CreateContentReportCommandValidator : AbstractValidator<CreateContentReportCommand>
{
    public CreateContentReportCommandValidator()
    {
        RuleFor(x => x.TargetType)
            .NotEmpty().WithMessage("Target type is required.")
            .MaximumLength(50);

        RuleFor(x => x.TargetId)
            .NotEmpty().WithMessage("Target ID is required.")
            .MaximumLength(150);

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Reason is required.")
            .MaximumLength(100);

        RuleFor(x => x.Details)
            .MaximumLength(2000).WithMessage("Details must not exceed 2000 characters.");
    }
}

public class CreateContentReportCommandHandler : IRequestHandler<CreateContentReportCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateContentReportCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<Guid>> Handle(CreateContentReportCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthorized", "You must be authenticated to submit a report.");
        }

        var label = !string.IsNullOrWhiteSpace(request.Details)
            ? $"{request.TargetLabel}: {request.Details}"
            : request.TargetLabel;

        var report = new ContentReport(
            userId,
            request.TargetType,
            request.TargetId,
            label,
            request.Reason);

        _context.ContentReports.Add(report);
        await _context.SaveChangesAsync(ct);

        return Result.Success(report.Id);
    }
}
