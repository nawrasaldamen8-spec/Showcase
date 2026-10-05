using Showcase.Application.Features.Auth.Common;

namespace Showcase.Application.Features.Auth.Commands;



public record RegisterGoogleCommand(
    string Token,
    string Username,
    string Name,
    string? Specialty = null,
    string? Bio = null,
    string? PictureUrl = null) : IRequest<Result<AuthResponse>>;



public class RegisterGoogleCommandHandler(
    IIdentityService identityService,
    ITokenService tokenService,
    IAuthSessionOrchestrator authOrchestrator) : IRequestHandler<RegisterGoogleCommand, Result<AuthResponse>>
{
    private readonly IIdentityService _identityService = identityService;
    private readonly ITokenService _tokenService = tokenService;
    private readonly IAuthSessionOrchestrator _authOrchestrator = authOrchestrator;

    public async Task<Result<AuthResponse>> Handle(RegisterGoogleCommand request, CancellationToken ct)
    {
        var payload = _tokenService.ValidateOnboardingToken(request.Token);
        if (payload is null)
        {
            return Error.Unauthorized("Auth.InvalidOnboardingToken", "The Google onboarding session has expired or is invalid. Please sign up with Google again.");
        }

        var pictureUrl = !string.IsNullOrWhiteSpace(request.PictureUrl) ? request.PictureUrl : payload.PictureUrl;

        var result = await _identityService.RegisterExternalUserAsync(
            payload.Provider,
            payload.ProviderKey,
            payload.Email,
            request.Username,
            request.Name,
            request.Specialty,
            request.Bio,
            pictureUrl,
            ct);

        if (result.IsFailure)
        {
            return Result.Failure<AuthResponse>(result.Error);
        }

        return await _authOrchestrator.CreateSessionAsync(result.Value, ct);
    }
}



public class RegisterGoogleCommandValidator : AbstractValidator<RegisterGoogleCommand>
{
    public RegisterGoogleCommandValidator()
    {
        RuleFor(x => x.Token)
            .NotEmpty().WithMessage("Onboarding token is required.");

        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required.")
            .MinimumLength(3).WithMessage("Username must be at least 3 characters.")
            .MaximumLength(30).WithMessage("Username cannot exceed 30 characters.")
            .Matches(@"^[a-zA-Z0-9_]+$").WithMessage("Username can only contain alphanumeric characters and underscores.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name cannot exceed 100 characters.");

        RuleFor(x => x.Bio)
            .MaximumLength(500).WithMessage("Bio cannot exceed 500 characters.")
            .When(x => !string.IsNullOrEmpty(x.Bio));

        RuleFor(x => x.Specialty)
            .MaximumLength(100).WithMessage("Specialty cannot exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.Specialty));
    }
}

