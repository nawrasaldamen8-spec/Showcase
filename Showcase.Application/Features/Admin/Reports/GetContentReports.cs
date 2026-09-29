using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Showcase.Application.Features.Admin.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Admin.Reports;

public record GetContentReportsQuery(string? Status = null) : IRequest<Result<IReadOnlyList<ContentReportItemDto>>>;

public class GetContentReportsQueryHandler : IRequestHandler<GetContentReportsQuery, Result<IReadOnlyList<ContentReportItemDto>>>
{
    public Task<Result<IReadOnlyList<ContentReportItemDto>>> Handle(GetContentReportsQuery request, CancellationToken ct)
    {
        var list = new List<ContentReportItemDto>();
        return Task.FromResult(Result.Success<IReadOnlyList<ContentReportItemDto>>(list));
    }
}
