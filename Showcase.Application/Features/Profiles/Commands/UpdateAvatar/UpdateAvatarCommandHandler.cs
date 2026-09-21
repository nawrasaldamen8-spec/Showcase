using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;
using Showcase.Domain.ValueObjects;

namespace Showcase.Application.Features.Profiles.Commands.UpdateAvatar;

public class UpdateAvatarCommandHandler : IRequestHandler<UpdateAvatarCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IStorageService _storageService;

    public UpdateAvatarCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IStorageService storageService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _storageService = storageService;
    }

    public async Task<Result> Handle(UpdateAvatarCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthorized", "User is not authenticated.");
        }

        var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserId == userId, ct);
        if (profile is null)
        {
            return ProfileErrors.NotFoundForUser(userId);
        }

        var storageKeyResult = StorageKey.Create(request.StorageKey);
        if (storageKeyResult.IsFailure)
        {
            return Result.Failure(storageKeyResult.Error);
        }

        // Clean up previous avatar if it exists and differs
        if (profile.AvatarKey is not null && profile.AvatarKey.Value != storageKeyResult.Value.Value)
        {
            await _storageService.DeleteAsync(profile.AvatarKey.Value, ct);
        }

        profile.SetAvatar(storageKeyResult.Value);
        await _context.SaveChangesAsync(ct);

        return Result.Success();
    }
}
