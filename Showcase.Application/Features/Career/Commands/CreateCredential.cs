using Showcase.Application.Features.Career.Common;

namespace Showcase.Application.Features.Career.Commands;

using Showcase.Application.Features.Career.Common;

public record CreateCredentialCommand(
    string Name,
    string IssuingOrganization,
    string IssueDate,
    string? ExpiryDate = null,
    bool DoesNotExpire = false,
    string? CredentialId = null,
    string? VerificationUrl = null,
    string? MediaUrl = null) : IRequest<Result<CareerCredentialDto>>;

public class CreateCredentialCommandValidator : AbstractValidator<CreateCredentialCommand>
{
    public CreateCredentialCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Credential name is required.")
            .MaximumLength(150).WithMessage("Credential name must not exceed 150 characters.");

        RuleFor(x => x.IssuingOrganization)
            .NotEmpty().WithMessage("Issuing organization is required.")
            .MaximumLength(150).WithMessage("Issuing organization must not exceed 150 characters.");

        RuleFor(x => x.IssueDate)
            .NotEmpty().WithMessage("Issue date is required.");
    }
}

public class CreateCredentialCommandHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context) : IRequestHandler<CreateCredentialCommand, Result<CareerCredentialDto>>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result<CareerCredentialDto>> Handle(CreateCredentialCommand request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<CareerCredentialDto>(profileResult.Error);

        var profile = profileResult.Value;

        var expiry = request.DoesNotExpire ? null : request.ExpiryDate;
        var dateRangeResult = DateRange.Create(request.IssueDate, expiry);
        if (dateRangeResult.IsFailure)
            return Result.Failure<CareerCredentialDto>(dateRangeResult.Error);

        Url? verificationUrl = null;
        if (!string.IsNullOrWhiteSpace(request.VerificationUrl))
        {
            var urlResult = Url.Create(request.VerificationUrl);
            if (urlResult.IsFailure)
                return Result.Failure<CareerCredentialDto>(urlResult.Error);
            verificationUrl = urlResult.Value;
        }

        StorageKey? mediaKey = null;
        if (!string.IsNullOrWhiteSpace(request.MediaUrl))
        {
            var keyResult = StorageKey.Create(request.MediaUrl);
            if (keyResult.IsSuccess)
                mediaKey = keyResult.Value;
        }

        var credential = profile.AddCredential(
            request.Name,
            request.IssuingOrganization,
            dateRangeResult.Value,
            request.CredentialId,
            verificationUrl,
            mediaKey);

        _context.Credentials.Add(credential);
        await _context.SaveChangesAsync(ct);

        return credential.ToDto();
    }
}

