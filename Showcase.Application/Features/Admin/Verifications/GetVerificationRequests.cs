using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Admin.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Admin.Verifications;

public record GetVerificationRequestsQuery : IRequest<Result<IReadOnlyList<VerificationRequestItemDto>>>;

public class GetVerificationRequestsQueryHandler : IRequestHandler<GetVerificationRequestsQuery, Result<IReadOnlyList<VerificationRequestItemDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly IStorageService _storageService;

    public GetVerificationRequestsQueryHandler(
        IApplicationDbContext context,
        IIdentityService identityService,
        IStorageService storageService)
    {
        _context = context;
        _identityService = identityService;
        _storageService = storageService;
    }

    public async Task<Result<IReadOnlyList<VerificationRequestItemDto>>> Handle(GetVerificationRequestsQuery request, CancellationToken ct)
    {
        var requests = await _context.VerificationRequests
            .OrderByDescending(v => v.CreatedAtUtc)
            .Take(100)
            .ToListAsync(ct);

        var list = new List<VerificationRequestItemDto>();

        foreach (var req in requests)
        {
            var userResult = await _identityService.GetUserByIdAsync(req.UserId, ct);
            var username = userResult.IsSuccess ? userResult.Value.UserName : "unknown";

            var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserId == req.UserId, ct);
            var name = profile?.Name ?? username;
            var avatarUrl = profile?.AvatarKey is not null
                ? _storageService.GetPublicUrl(profile.AvatarKey.Value)
                : null;

            list.Add(new VerificationRequestItemDto(
                req.Id,
                req.UserId,
                username,
                name,
                avatarUrl,
                req.Category,
                req.Message,
                req.Status.ToString().ToLowerInvariant(),
                req.CreatedAtUtc));
        }

        return list;
    }
}
