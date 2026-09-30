using System.Text.RegularExpressions;
using FluentValidation;

namespace Showcase.Application.Features.Profiles.Commands.UpdatePhone;

public class UpdatePhoneCommandValidator : AbstractValidator<UpdatePhoneCommand>
{
    private static readonly Regex PhoneRegex = new(@"^\+?[1-9]\d{6,14}$", RegexOptions.Compiled);

    public UpdatePhoneCommandValidator()
    {
        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("Phone number is required.")
            .MaximumLength(30).WithMessage("Phone number cannot exceed 30 characters.")
            .Must(BeAValidPhoneNumber).WithMessage("Invalid phone number format. Provide a valid international format (e.g. +1234567890).");
    }

    private static bool BeAValidPhoneNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return false;

        var clean = phoneNumber.Trim().Replace(" ", "").Replace("-", "");
        return PhoneRegex.IsMatch(clean);
    }
}
