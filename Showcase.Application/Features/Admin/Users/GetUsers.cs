using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Admin.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Enums;

namespace Showcase.Application.Features.Admin.Users;

public record GetUsersQuery(
    string? Search = null,
    string? Status = null,
    string? Role = null) : IRequest<Result<IReadOnlyList<AdminUserListItemDto>>>;

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, Result<IReadOnlyList<AdminUserListItemDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly IStorageService _storageService;

    public GetUsersQueryHandler(
        IApplicationDbContext context,
        IIdentityService identityService,
        IStorageService storageService)
    {
        _context = context;
        _identityService = identityService;
        _storageService = storageService;
    }

    public async Task<Result<IReadOnlyList<AdminUserListItemDto>>> Handle(GetUsersQuery request, CancellationToken ct)
    {
        var query = _context.Profiles
            .IgnoreQueryFilters()
            .Where(p => !p.IsDeleted)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(search) ||
                (p.Specialty != null && p.Specialty.ToLower().Contains(search)) ||
                (p.Country != null && p.Country.ToLower().Contains(search)));
        }

        if (request.Status == "active")
        {
            query = query.Where(p => !p.IsBanned && !p.IsDeleted);
        }
        else if (request.Status == "suspended")
        {
            query = query.Where(p => p.IsBanned);
        }

        var profiles = await query
            .OrderByDescending(p => p.CreatedAt)
            .Take(100)
            .ToListAsync(ct);

        var list = new List<AdminUserListItemDto>();

        foreach (var profile in profiles)
        {
            var userResult = await _identityService.GetUserByIdAsync(profile.UserId, ct);
            var username = userResult.IsSuccess ? userResult.Value.UserName : "unknown";
            var email = userResult.IsSuccess ? userResult.Value.Email : null;
            var roles = userResult.IsSuccess ? userResult.Value.Roles : new List<string>();

            if (!string.IsNullOrWhiteSpace(request.Role) && request.Role != "all")
            {
                if (!roles.Contains(request.Role, StringComparer.OrdinalIgnoreCase))
                {
                    continue;
                }
            }

            var postsCount = await _context.Posts
                .CountAsync(p => p.ProfileId == profile.Id && p.Status == PostStatus.Published, ct);

            var avatarUrl = profile.AvatarKey is not null
                ? _storageService.GetPublicUrl(profile.AvatarKey.Value)
                : null;

            list.Add(new AdminUserListItemDto(
                profile.UserId,
                username,
                profile.Name,
                email,
                avatarUrl,
                profile.IsVerified,
                profile.IsBanned ? "suspended" : "active",
                profile.BanReason,
                postsCount,
                postsCount * 850_000L,
                roles.ToList(),
                profile.CreatedAt));
        }

        return list;
    }
}
