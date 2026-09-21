using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;
using Showcase.Domain.ValueObjects;

namespace Showcase.Application.Features.Posts.Commands.CreatePost;

public class CreatePostCommandHandler : IRequestHandler<CreatePostCommand, Result<Guid>>
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

    public async Task<Result<Guid>> Handle(CreatePostCommand request, CancellationToken ct)
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

        Url? externalUrl = null;
        if (!string.IsNullOrWhiteSpace(request.ExternalUrl))
        {
            var urlResult = Url.Create(request.ExternalUrl);
            if (urlResult.IsFailure)
            {
                return Result.Failure<Guid>(urlResult.Error);
            }
            externalUrl = urlResult.Value;
        }

        var post = new Post(profile.Id, request.Title, request.Description, externalUrl);
        _context.Posts.Add(post);
        await _context.SaveChangesAsync(ct);

        return post.Id;
    }
}
