using System;
using System.Linq;
using FluentValidation;

namespace Showcase.Application.Features.Posts.Commands.GetPostImageUploadUrl;

public class GetPostImageUploadUrlCommandValidator : AbstractValidator<GetPostImageUploadUrlCommand>
{
    private static readonly string[] AllowedContentTypes =
    [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ];

    public const long MaxSizeBytes = 10 * 1024 * 1024; // 10 MB

    public GetPostImageUploadUrlCommandValidator()
    {
        RuleFor(x => x.PostId)
            .NotEmpty().WithMessage("Post ID is required.");

        RuleFor(x => x.ContentType)
            .NotEmpty().WithMessage("Content-Type is required.")
            .Must(type => AllowedContentTypes.Contains(type.Trim().ToLowerInvariant()))
            .WithMessage("Unsupported image format. Allowed formats: image/jpeg, image/png, image/webp, image/gif.");

        RuleFor(x => x.FileSizeBytes)
            .GreaterThan(0).WithMessage("File size must be greater than 0.")
            .LessThanOrEqualTo(MaxSizeBytes).WithMessage($"File size cannot exceed {MaxSizeBytes / (1024 * 1024)} MB.");
    }
}
