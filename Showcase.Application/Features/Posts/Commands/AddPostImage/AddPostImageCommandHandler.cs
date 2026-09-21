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

namespace Showcase.Application.Features.Posts.Commands.AddPostImage;

public class AddPostImageCommandHandler : IRequestHandler<AddPostImageCommand, Result<PostImageDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IStorageService _storageService;

    public AddPostImageCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IStorageService storageService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _storageService = storageService;
    }

    public async Task<Result<PostImageDto>> Handle(AddPostImageCommand request, CancellationToken ct)
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

        var storageKeyResult = StorageKey.Create(request.StorageKey);
        if (storageKeyResult.IsFailure)
        {
            return Result.Failure<PostImageDto>(storageKeyResult.Error);
        }

        var image = post.AddImage(storageKeyResult.Value, request.DisplayOrder);
        _context.PostImages.Add(image);
        await _context.SaveChangesAsync(ct);

        var url = _storageService.GetPublicUrl(image.StorageKey.Value);
        return new PostImageDto(image.Id, image.StorageKey.Value, url, image.DisplayOrder);
    }
}
