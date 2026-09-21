using System;
using FluentValidation;
using Showcase.Domain.ValueObjects;

namespace Showcase.Application.Features.Posts.Commands.UpdatePost;

public class UpdatePostCommandValidator : AbstractValidator<UpdatePostCommand>
{
    public UpdatePostCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Post ID is required.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title cannot exceed 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(4000).WithMessage("Description cannot exceed 4000 characters.");

        RuleFor(x => x.ExternalUrl)
            .MaximumLength(Url.MaxLength).WithMessage($"External URL cannot exceed {Url.MaxLength} characters.")
            .Must(BeAValidHttpUrl).WithMessage("External URL must be a valid HTTP or HTTPS URL.")
            .When(x => !string.IsNullOrWhiteSpace(x.ExternalUrl));
    }

    private static bool BeAValidHttpUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return true;
        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult) &&
               (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}
