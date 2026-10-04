using FluentValidation;
using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Profiles.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.ValueObjects;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.Profiles.Commands;



public record GetAvatarUploadUrlCommand(
    string ContentType,
    long FileSizeBytes) : IRequest<Result<AvatarUploadUrlResponse>>;



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

        var storageKey = StorageKey.ForAvatar(userId, request.ContentType);

        var uploadUrl = await _storageService.GetPresignedUploadUrlAsync(
            storageKey.Value,
            request.ContentType.Trim().ToLowerInvariant(),
            TimeSpan.FromMinutes(15),
            ct);

        return new AvatarUploadUrlResponse(uploadUrl, storageKey.Value);
    }
}



public class GetAvatarUploadUrlCommandValidator : AbstractValidator<GetAvatarUploadUrlCommand>
{
    private static readonly string[] AllowedContentTypes =
    [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ];

    public const long MaxSizeBytes = 5 * 1024 * 1024; // 5 MB

    public GetAvatarUploadUrlCommandValidator()
    {
        RuleFor(x => x.ContentType)
            .NotEmpty().WithMessage("Content-Type is required.")
            .Must(type => AllowedContentTypes.Contains(type.Trim().ToLowerInvariant()))
            .WithMessage("Unsupported image format. Allowed formats: image/jpeg, image/png, image/webp, image/gif.");

        RuleFor(x => x.FileSizeBytes)
            .GreaterThan(0).WithMessage("File size must be greater than 0.")
            .LessThanOrEqualTo(MaxSizeBytes).WithMessage($"File size cannot exceed {MaxSizeBytes / (1024 * 1024)} MB.");
    }
}

