namespace Showcase.Application.Features.Profiles.Commands;



public record UpdateProfileCommand(
    string Name,
    string? Specialty,
    string? Country,
    string? Bio) : IRequest<Result>;



public class UpdateProfileCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<UpdateProfileCommand, Result>
{
    private readonly IApplicationDbContext _context = context;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result> Handle(UpdateProfileCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthorized", "User is not authenticated.");
        }

        var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);
        if (profile is null)
        {
            return ProfileErrors.NotFoundForUser(userId);
        }

        var bioResult = Bio.CreateOptional(request.Bio);
        if (bioResult.IsFailure)
        {
            return Result.Failure(bioResult.Error);
        }

        profile.UpdateDetails(request.Name, request.Specialty, request.Country, bioResult.Value);
        await _context.SaveChangesAsync(ct);

        return Result.Success();
    }
}



public class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(150).WithMessage("Name cannot exceed 150 characters.");

        RuleFor(x => x.Specialty)
            .MaximumLength(100).WithMessage("Specialty cannot exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.Specialty));

        RuleFor(x => x.Country)
            .MaximumLength(100).WithMessage("Country cannot exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.Country));

        RuleFor(x => x.Bio)
            .MaximumLength(Bio.MaxLength).WithMessage($"Bio cannot exceed {Bio.MaxLength} characters.")
            .When(x => !string.IsNullOrEmpty(x.Bio));
    }
}

