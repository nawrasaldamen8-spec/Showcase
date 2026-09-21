using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Profiles.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Profiles.Commands.GetAvatarUploadUrl;

public class GetAvatarUploadUrlCommandHandler : IRequestHandler<GetAvatarUploadUrlCommand, Result<AvatarUploadUrlResponse>>
{
    private readonly IStorageService _storageService;
    private readonly ICurrentUserService _currentUserService;

    public GetAvatarUploadUrlCommandHandler(
        IStorageService storageService,
        ICurrentUserService currentUserService)
    {
        _storageService = storageService;
        _currentUserService = currentUserService;
    }

    public async Task<Result<AvatarUploadUrlResponse>> Handle(GetAvatarUploadUrlCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthorized", "User is not authenticated.");
        }

        var extension = request.ContentType.Trim().ToLowerInvariant() switch
        {
            "image/jpeg" => "jpg",
            "image/png" => "png",
            "image/webp" => "webp",
            "image/gif" => "gif",
            _ => "jpg"
        };

        var storageKey = $"avatars/{userId}/{Guid.NewGuid():N}.{extension}";

        var uploadUrl = await _storageService.GetPresignedUploadUrlAsync(
            storageKey,
            request.ContentType.Trim().ToLowerInvariant(),
            TimeSpan.FromMinutes(15),
            ct);

        return new AvatarUploadUrlResponse(uploadUrl, storageKey);
    }
}
