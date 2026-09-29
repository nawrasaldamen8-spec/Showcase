using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Admin.Reports;

public record DismissReportCommand(Guid ReportId) : IRequest<Result>;

public class DismissReportCommandHandler : IRequestHandler<DismissReportCommand, Result>
{
    public Task<Result> Handle(DismissReportCommand request, CancellationToken ct)
    {
        return Task.FromResult(Result.Success());
    }
}
