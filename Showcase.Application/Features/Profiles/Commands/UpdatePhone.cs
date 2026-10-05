namespace Showcase.Application.Features.Profiles.Commands;



public record UpdatePhoneCommand(string PhoneNumber) : IRequest<Result>;



public class UpdatePhoneCommandHandler(
    ICurrentUserService currentUserService,
    IIdentityService identityService) : IRequestHandler<UpdatePhoneCommand, Result>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IIdentityService _identityService = identityService;

    public async Task<Result> Handle(UpdatePhoneCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthorized", "User is not authenticated.");
        }

        return await _identityService.UpdatePhoneNumberAsync(userId, request.PhoneNumber, ct);
    }
}



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

