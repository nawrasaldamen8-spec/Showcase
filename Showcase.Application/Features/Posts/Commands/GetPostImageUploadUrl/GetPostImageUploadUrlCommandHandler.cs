using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Posts.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Posts.Commands.GetPostImageUploadUrl;

public class GetPostImageUploadUrlCommandHandler : IRequestHandler<GetPostImageUploadUrlCommand, Result<PostImageUploadUrlResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IStorageService _storageService;

    public GetPostImageUploadUrlCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IStorageService storageService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _storageService = storageService;
    }

    public async Task<Result<PostImageUploadUrlResponse>> Handle(GetPostImageUploadUrlCommand request, CancellationToken ct)
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

        var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == request.PostId, ct);
        if (post is null)
        {
            return PostErrors.NotFound(request.PostId);
        }

        if (post.ProfileId != profile.Id)
        {
            return PostErrors.UnauthorizedAccess;
        }

        var extension = request.ContentType.Trim().ToLowerInvariant() switch
        {
            "image/jpeg" => "jpg",
            "image/png" => "png",
            "image/webp" => "webp",
            "image/gif" => "gif",
            _ => "jpg"
        };

        var storageKey = $"posts/{post.Id}/{Guid.NewGuid():N}.{extension}";

        var uploadUrl = await _storageService.GetPresignedUploadUrlAsync(
            storageKey,
            request.ContentType.Trim().ToLowerInvariant(),
            TimeSpan.FromMinutes(15),
            ct);

        return new PostImageUploadUrlResponse(uploadUrl, storageKey);
    }
}
