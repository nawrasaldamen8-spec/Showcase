using Showcase.Application.Features.Career.Common;

namespace Showcase.Application.Features.Career.Commands;

using Showcase.Application.Features.Career.Common;

public record CreateAcademicCommand(
    string Institution,
    string Degree,
    string FieldOfStudy,
    string StartDate,
    string? EndDate = null,
    bool CurrentlyStudying = false,
    string? Gpa = null,
    string? Achievements = null,
    string? Location = null,
    string? Description = null) : IRequest<Result<CareerAcademicDto>>;

public class CreateAcademicCommandValidator : AbstractValidator<CreateAcademicCommand>
{
    public CreateAcademicCommandValidator()
    {
        RuleFor(x => x.Institution)
            .NotEmpty().WithMessage("Institution name is required.")
            .MaximumLength(150).WithMessage("Institution must not exceed 150 characters.");

        RuleFor(x => x.Degree)
            .NotEmpty().WithMessage("Degree is required.")
            .MaximumLength(100).WithMessage("Degree must not exceed 100 characters.");

        RuleFor(x => x.FieldOfStudy)
            .NotEmpty().WithMessage("Field of study is required.")
            .MaximumLength(150).WithMessage("Field of study must not exceed 150 characters.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required.");
    }
}

public class CreateAcademicCommandHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context) : IRequestHandler<CreateAcademicCommand, Result<CareerAcademicDto>>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result<CareerAcademicDto>> Handle(CreateAcademicCommand request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<CareerAcademicDto>(profileResult.Error);

        var profile = profileResult.Value;

        var endDate = request.CurrentlyStudying ? null : request.EndDate;
        var dateRangeResult = DateRange.Create(request.StartDate, endDate);
        if (dateRangeResult.IsFailure)
            return Result.Failure<CareerAcademicDto>(dateRangeResult.Error);

        var academic = profile.AddAcademic(
            request.Institution,
            request.Degree,
            request.FieldOfStudy,
            dateRangeResult.Value,
            request.Gpa,
            request.Achievements,
            request.Location,
            request.Description);

        _context.Academics.Add(academic);
        await _context.SaveChangesAsync(ct);

        return academic.ToDto();
    }
}

