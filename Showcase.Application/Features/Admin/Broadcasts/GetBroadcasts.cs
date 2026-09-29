using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Showcase.Application.Features.Admin.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Admin.Broadcasts;

public record GetBroadcastsQuery : IRequest<Result<IReadOnlyList<BroadcastAnnouncementItemDto>>>;

public class GetBroadcastsQueryHandler : IRequestHandler<GetBroadcastsQuery, Result<IReadOnlyList<BroadcastAnnouncementItemDto>>>
{
    public Task<Result<IReadOnlyList<BroadcastAnnouncementItemDto>>> Handle(GetBroadcastsQuery request, CancellationToken ct)
    {
        var list = new List<BroadcastAnnouncementItemDto>
        {
            new(Guid.NewGuid(), "Welcome to Pority", "Platform is running in production readiness mode.", "info", "admin", DateTime.UtcNow, null)
        };
        return Task.FromResult(Result.Success<IReadOnlyList<BroadcastAnnouncementItemDto>>(list));
    }
}
