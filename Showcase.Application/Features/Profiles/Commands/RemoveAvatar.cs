using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.Profiles.Commands;



public record RemoveAvatarCommand : IRequest<Result>;



public class RemoveAvatarCommandHandler : IRequestHandler<RemoveAvatarCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IStorageService _storageService;

    public RemoveAvatarCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IStorageService storageService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _storageService = storageService;
    }

    public async Task<Result> Handle(RemoveAvatarCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthorized", "User is not authenticated.");
        }

        var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);
        if (profile is null)
        {
            return ProfileErrors.NotFoundForUser(userId);
        }

        if (profile.AvatarKey is not null)
        {
            await _storageService.DeleteAsync(profile.AvatarKey.Value, ct);
            profile.RemoveAvatar();
            await _context.SaveChangesAsync(ct);
        }

        return Result.Success();
    }
}

