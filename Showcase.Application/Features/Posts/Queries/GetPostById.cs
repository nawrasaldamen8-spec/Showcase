using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Posts.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;
using Showcase.Domain.Enums;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.Posts.Queries;



public record GetPostByIdQuery(Guid Id) : IRequest<Result<PostResponse>>;



public class GetPostByIdQueryHandler : IRequestHandler<GetPostByIdQuery, Result<PostResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;
    private readonly IStorageService _storageService;

    public GetPostByIdQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IIdentityService identityService,
        IStorageService storageService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _identityService = identityService;
        _storageService = storageService;
    }

    public async Task<Result<PostResponse>> Handle(GetPostByIdQuery request, CancellationToken ct)
    {
        var currentUserId = _currentUserService.UserId;

        var post = await _context.Posts
            .Include(p => p.Images)
            .Include(p => p.PostTags)
                .ThenInclude(pt => pt.Tag)
            .FirstOrDefaultAsync(p => p.Id == request.Id, ct);

        if (post is null)
        {
            return PostErrors.NotFound(request.Id);
        }

        var profile = await _context.Profiles
            .FirstOrDefaultAsync(p => p.Id == post.ProfileId, ct);

        if (profile is null)
        {
            return PostErrors.NotFound(request.Id);
        }

        var isOwner = !string.IsNullOrWhiteSpace(currentUserId) && profile.UserId == currentUserId;

        // If author profile is deleted or banned, hide post unless owner is viewing
        if ((profile.IsDeleted || profile.IsBanned) && !isOwner)
        {
            return PostErrors.NotFound(request.Id);
        }

        // If post is not published, only the post owner can view it
        if (post.Status != PostStatus.Published && !isOwner)
        {
            return PostErrors.NotFound(request.Id);
        }

        // Resolve creator identity
        PostCreatorDto? creator = null;
        var userResult = await _identityService.GetUserByIdAsync(profile.UserId, ct);
        if (userResult.IsSuccess)
        {
            var avatarUrl = profile.AvatarKey is not null
                ? _storageService.GetPublicUrl(profile.AvatarKey.Value)
                : null;

            creator = new PostCreatorDto(
                profile.Id,
                userResult.Value.UserName,
                profile.Name,
                avatarUrl);
        }

        var images = post.Images
            .OrderBy(i => i.DisplayOrder)
            .Select(i => new PostImageDto(
                i.Id,
                i.StorageKey.Value,
                _storageService.GetPublicUrl(i.StorageKey.Value),
                i.DisplayOrder))
            .ToList();

        var tags = post.PostTags
            .Where(pt => pt.Tag != null)
            .Select(pt => pt.Tag.Name)
            .ToList();

        bool isLiked = false;
        if (!string.IsNullOrWhiteSpace(currentUserId))
        {
            isLiked = await _context.PostLikes
                .AnyAsync(l => l.PostId == post.Id && l.UserId == currentUserId, ct);
        }

        return new PostResponse(
            post.Id,
            post.ProfileId,
            post.Title,
            post.Description,
            post.ExternalUrl?.Value,
            post.Status.ToString(),
            post.CreatedAt,
            post.PublishedAt,
            post.UpdatedAt,
            images,
            tags,
            creator,
            post.LikesCount,
            isLiked);
    }
}

