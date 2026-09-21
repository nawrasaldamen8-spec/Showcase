using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Posts.Commands.UnpublishPost;

public class UnpublishPostCommandHandler : IRequestHandler<UnpublishPostCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UnpublishPostCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(UnpublishPostCommand request, CancellationToken ct)
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

        var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == request.Id, ct);
        if (post is null)
        {
            return PostErrors.NotFound(request.Id);
        }

        if (post.ProfileId != profile.Id)
        {
            return PostErrors.UnauthorizedAccess;
        }

        var unpublishResult = post.Unpublish();
        if (unpublishResult.IsFailure)
        {
            return unpublishResult;
        }

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}
