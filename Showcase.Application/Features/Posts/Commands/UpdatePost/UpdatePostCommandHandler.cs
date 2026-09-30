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

        var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);
        if (profile is null)
        {
            return ProfileErrors.NotFoundForUser(userId);
        }

        var post = await _context.Posts
            .Include(p => p.PostTags)
            .FirstOrDefaultAsync(p => p.Id == request.Id, ct);
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

        if (request.Tags is not null)
        {
            post.ClearTags();
            foreach (var rawTagName in request.Tags)
            {
                if (string.IsNullOrWhiteSpace(rawTagName)) continue;
                var normalized = Tag.NormalizeTag(rawTagName);
                if (string.IsNullOrEmpty(normalized)) continue;

                var tag = await _context.Tags.FirstOrDefaultAsync(t => t.NormalizedName == normalized, ct);
                if (tag is null)
                {
                    tag = new Tag(rawTagName);
                    _context.Tags.Add(tag);
                }

                post.AddTag(tag.Id);
            }
        }

        await _context.SaveChangesAsync(ct);

        return Result.Success();
    }
}
