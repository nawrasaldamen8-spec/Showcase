using System;
using FluentValidation;
using Showcase.Domain.ValueObjects;

namespace Showcase.Application.Features.SocialLinks.Commands.UpdateSocialLink;

public class UpdateSocialLinkCommandValidator : AbstractValidator<UpdateSocialLinkCommand>
{
    public UpdateSocialLinkCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Social link ID is required.");

        RuleFor(x => x.Platform)
            .NotEmpty().WithMessage("Platform is required.")
            .MaximumLength(50).WithMessage("Platform cannot exceed 50 characters.");

        RuleFor(x => x.Url)
            .NotEmpty().WithMessage("URL is required.")
            .MaximumLength(Url.MaxLength).WithMessage($"URL cannot exceed {Url.MaxLength} characters.")
            .Must(BeAValidHttpUrl).WithMessage("URL must be a valid HTTP or HTTPS URL.");
    }

    private static bool BeAValidHttpUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult) &&
               (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}
