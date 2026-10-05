using Showcase.Application.Features.Career.Common;

namespace Showcase.Application.Features.Career.Commands;

using Showcase.Application.Features.Career.Common;

public record CreateExperienceCommand(
    string JobTitle,
    string Company,
    string StartDate,
    string? EndDate = null,
    bool CurrentlyWorking = false,
    string? Description = null,
    string? Achievements = null,
    string? EmploymentType = null,
    string? Location = null,
    IReadOnlyList<string>? SkillsUsed = null) : IRequest<Result<CareerExperienceDto>>;

public class CreateExperienceCommandValidator : AbstractValidator<CreateExperienceCommand>
{
    public CreateExperienceCommandValidator()
    {
        RuleFor(x => x.JobTitle)
            .NotEmpty().WithMessage("Job title is required.")
            .MaximumLength(150).WithMessage("Job title must not exceed 150 characters.");

        RuleFor(x => x.Company)
            .NotEmpty().WithMessage("Company name is required.")
            .MaximumLength(150).WithMessage("Company name must not exceed 150 characters.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required.");
    }
}

public class CreateExperienceCommandHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context) : IRequestHandler<CreateExperienceCommand, Result<CareerExperienceDto>>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result<CareerExperienceDto>> Handle(CreateExperienceCommand request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<CareerExperienceDto>(profileResult.Error);

        var profile = profileResult.Value;

        var endDate = request.CurrentlyWorking ? null : request.EndDate;
        var dateRangeResult = DateRange.Create(request.StartDate, endDate);
        if (dateRangeResult.IsFailure)
            return Result.Failure<CareerExperienceDto>(dateRangeResult.Error);

        var experience = profile.AddExperience(
            request.JobTitle,
            request.Company,
            dateRangeResult.Value,
            request.Description,
            request.Achievements,
            request.EmploymentType,
            request.Location,
            request.SkillsUsed);

        _context.Experiences.Add(experience);
        await _context.SaveChangesAsync(ct);

        return experience.ToDto();
    }
}

