using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Posts.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;
using Showcase.Domain.ValueObjects;

namespace Showcase.Application.Features.Posts.Commands.CreatePost;

public class CreatePostCommandHandler : IRequestHandler<CreatePostCommand, Result<PostCreatedResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreatePostCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PostCreatedResponse>> Handle(CreatePostCommand request, CancellationToken ct)
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

        Url? externalUrl = null;
        if (!string.IsNullOrWhiteSpace(request.ExternalUrl))
        {
            var urlResult = Url.Create(request.ExternalUrl);
            if (urlResult.IsFailure)
            {
                return Result.Failure<PostCreatedResponse>(urlResult.Error);
            }
            externalUrl = urlResult.Value;
        }

        var post = new Post(profile.Id, request.Title, request.Description, externalUrl);

        if (request.Tags is not null && request.Tags.Count > 0)
        {
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

        _context.Posts.Add(post);
        await _context.SaveChangesAsync(ct);

        return new PostCreatedResponse(post.Id);
    }
}
