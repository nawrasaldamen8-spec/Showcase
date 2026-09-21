using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Posts.Commands.DeletePost;

public class DeletePostCommandHandler : IRequestHandler<DeletePostCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IStorageService _storageService;

    public DeletePostCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IStorageService storageService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _storageService = storageService;
    }

    public async Task<Result> Handle(DeletePostCommand request, CancellationToken ct)
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

        var post = await _context.Posts
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == request.Id, ct);

        if (post is null)
        {
            return PostErrors.NotFound(request.Id);
        }

        if (post.ProfileId != profile.Id)
        {
            return PostErrors.UnauthorizedAccess;
        }

        // Delete all images from object storage
        foreach (var image in post.Images)
        {
            try
            {
                await _storageService.DeleteAsync(image.StorageKey.Value, ct);
            }
            catch
            {
                // Proceed with deletion even if individual storage deletion fails
            }
        }

        _context.Posts.Remove(post);
        await _context.SaveChangesAsync(ct);

        return Result.Success();
    }
}
