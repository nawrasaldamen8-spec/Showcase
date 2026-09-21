using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Posts.Commands.ReorderPostImages;

public class ReorderPostImagesCommandHandler : IRequestHandler<ReorderPostImagesCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ReorderPostImagesCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(ReorderPostImagesCommand request, CancellationToken ct)
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
            .FirstOrDefaultAsync(p => p.Id == request.PostId, ct);

        if (post is null)
        {
            return PostErrors.NotFound(request.PostId);
        }

        if (post.ProfileId != profile.Id)
        {
            return PostErrors.UnauthorizedAccess;
        }

        var dictionary = request.Items.ToDictionary(x => x.Id, x => x.DisplayOrder);
        post.ReorderImages(dictionary);

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}
