using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;
using Showcase.Domain.ValueObjects;

namespace Showcase.Application.Features.Posts.Commands.UpdatePost;

public class UpdatePostCommandHandler : IRequestHandler<UpdatePostCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdatePostCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(UpdatePostCommand request, CancellationToken ct)
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

        Url? externalUrl = null;
        if (!string.IsNullOrWhiteSpace(request.ExternalUrl))
        {
            var urlResult = Url.Create(request.ExternalUrl);
            if (urlResult.IsFailure)
            {
                return Result.Failure(urlResult.Error);
            }
            externalUrl = urlResult.Value;
        }

        post.UpdateDetails(request.Title, request.Description, externalUrl);
        await _context.SaveChangesAsync(ct);

        return Result.Success();
    }
}
