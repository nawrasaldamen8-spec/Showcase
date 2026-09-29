using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Admin.Reports;

public record ResolveReportCommand(
    Guid ReportId,
    string ActionTaken) : IRequest<Result>;

public class ResolveReportCommandHandler : IRequestHandler<ResolveReportCommand, Result>
{
    public Task<Result> Handle(ResolveReportCommand request, CancellationToken ct)
    {
        return Task.FromResult(Result.Success());
    }
}
