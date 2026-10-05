using Showcase.Application.Features.Career.Common;

namespace Showcase.Application.Features.Career.Commands;

using Showcase.Application.Features.Career.Common;

public record CreateSkillCommand(
    string Name,
    string? Category = null) : IRequest<Result<CareerSkillDto>>;

public class CreateSkillCommandValidator : AbstractValidator<CreateSkillCommand>
{
    public CreateSkillCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Skill name is required.")
            .MaximumLength(100).WithMessage("Skill name must not exceed 100 characters.");
    }
}

public class CreateSkillCommandHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context) : IRequestHandler<CreateSkillCommand, Result<CareerSkillDto>>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result<CareerSkillDto>> Handle(CreateSkillCommand request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<CareerSkillDto>(profileResult.Error);

        var profile = profileResult.Value;

        var skill = profile.AddSkill(request.Name, request.Category);
        _context.Skills.Add(skill);
        await _context.SaveChangesAsync(ct);

        return skill.ToDto();
    }
}

