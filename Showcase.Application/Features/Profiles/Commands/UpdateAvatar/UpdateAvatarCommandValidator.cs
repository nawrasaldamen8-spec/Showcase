using FluentValidation;
using Showcase.Domain.ValueObjects;

namespace Showcase.Application.Features.Profiles.Commands.UpdateAvatar;

public class UpdateAvatarCommandValidator : AbstractValidator<UpdateAvatarCommand>
{
    public UpdateAvatarCommandValidator()
    {
        RuleFor(x => x.StorageKey)
            .NotEmpty().WithMessage("Storage key is required.")
            .MaximumLength(StorageKey.MaxLength).WithMessage($"Storage key cannot exceed {StorageKey.MaxLength} characters.");
    }
}
