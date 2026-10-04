using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.Auth.Commands;



public record DevToggleBanResponse(bool IsBanned, string? BanReason);

public record ToggleDevBanCommand : IRequest<Result<DevToggleBanResponse>>;

public class ToggleDevBanCommandHandler : IRequestHandler<ToggleDevBanCommand, Result<DevToggleBanResponse>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public ToggleDevBanCommandHandler(ICurrentUserService currentUserService, IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result<DevToggleBanResponse>> Handle(ToggleDevBanCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        var profile = await _context.Profiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.UserId == userId, ct);

        if (profile is null)
            return ProfileErrors.NotFoundForUser(userId);

        if (profile.IsBanned)
        {
            profile.Unban();
        }
        else
        {
            profile.Ban("Violation of platform community guidelines: repetitive distribution of unverified external media.");
        }

        await _context.SaveChangesAsync(ct);

        return new DevToggleBanResponse(profile.IsBanned, profile.BanReason);
    }
}

