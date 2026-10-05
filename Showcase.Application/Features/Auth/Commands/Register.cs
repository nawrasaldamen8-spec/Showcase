using Showcase.Application.Features.Auth.Common;

namespace Showcase.Application.Features.Auth.Commands;



public record RegisterCommand(
    string Username,
    string Password,
    string Name,
    string? Email = null,
    string? Bio = null,
    string? Specialty = null) : IRequest<Result<AuthResponse>>;



public class RegisterCommandHandler(
    IIdentityService identityService,
    IApplicationDbContext context,
    IAuthSessionOrchestrator authOrchestrator) : IRequestHandler<RegisterCommand, Result<AuthResponse>>
{
    private readonly IIdentityService _identityService = identityService;
    private readonly IApplicationDbContext _context = context;
    private readonly IAuthSessionOrchestrator _authOrchestrator = authOrchestrator;

    public async Task<Result<AuthResponse>> Handle(RegisterCommand request, CancellationToken ct)
    {
        await using var transaction = await _context.BeginTransactionAsync(ct);

        // 1. Register User in Identity
        var registerResult = await _identityService.RegisterUserAsync(
            request.Username,
            request.Password,
            request.Email,
            ct);

        if (registerResult.IsFailure)
        {
            return Result.Failure<AuthResponse>(registerResult.Error);
        }

        var userId = registerResult.Value;

        // 2. Provision linked Profile entity in Domain
        var bioResult = Showcase.Domain.ValueObjects.Bio.CreateOptional(request.Bio);
        if (bioResult.IsFailure)
        {
            return Result.Failure<AuthResponse>(bioResult.Error);
        }

        var profile = new Profile(userId, request.Name, specialty: request.Specialty, bio: bioResult.Value);
        _context.Set<Profile>().Add(profile);
        await _context.SaveChangesAsync(ct);

        await transaction.CommitAsync(ct);

        // 3. Create authenticated session via Orchestrator
        var user = new UserIdentityDetails(userId, request.Email, request.Username, new List<string>());
        return await _authOrchestrator.CreateSessionAsync(user, ct);
    }
}



public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required.")
            .Length(3, 30).WithMessage("Username must be between 3 and 30 characters.")
            .Matches("^[a-zA-Z0-9_-]+$").WithMessage("Username can only contain alphanumeric characters, underscores, and hyphens.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters long.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(150).WithMessage("Name must not exceed 150 characters.");

        // Email is optional; when supplied it must be usable for account recovery.
#pragma warning disable CS0618
        RuleFor(x => x.Email)
            .MaximumLength(256).WithMessage("Email must not exceed 256 characters.")
            .EmailAddress(FluentValidation.Validators.EmailValidationMode.Net4xRegex).WithMessage("Email must be a valid email address.")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));
#pragma warning restore CS0618

        RuleFor(x => x.Bio)
            .MaximumLength(1000).WithMessage("Bio must not exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Bio));

        RuleFor(x => x.Specialty)
            .MaximumLength(150).WithMessage("Specialty must not exceed 150 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Specialty));
    }
}

