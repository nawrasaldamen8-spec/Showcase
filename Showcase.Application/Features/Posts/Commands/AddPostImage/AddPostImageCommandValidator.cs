using FluentValidation;
using Showcase.Domain.ValueObjects;

namespace Showcase.Application.Features.Posts.Commands.AddPostImage;

public class AddPostImageCommandValidator : AbstractValidator<AddPostImageCommand>
{
    public AddPostImageCommandValidator()
    {
        RuleFor(x => x.PostId)
            .NotEmpty().WithMessage("Post ID is required.");

        RuleFor(x => x.StorageKey)
            .NotEmpty().WithMessage("Storage key is required.")
            .MaximumLength(StorageKey.MaxLength).WithMessage($"Storage key cannot exceed {StorageKey.MaxLength} characters.");

        RuleFor(x => x.DisplayOrder)
            .GreaterThanOrEqualTo(0).WithMessage("Display order cannot be negative.")
            .When(x => x.DisplayOrder.HasValue);
    }
}
