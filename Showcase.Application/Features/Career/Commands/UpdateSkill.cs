using Showcase.Application.Features.Career.Common;

namespace Showcase.Application.Features.Career.Commands;

using Showcase.Application.Features.Career.Common;

public record UpdateSkillCommand(
    Guid Id,
    string Name,
    string? Category = null) : IRequest<Result<CareerSkillDto>>;

public class UpdateSkillCommandValidator : AbstractValidator<UpdateSkillCommand>
{
    public UpdateSkillCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Skill ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Skill name is required.")
            .MaximumLength(100).WithMessage("Skill name must not exceed 100 characters.");
    }
}

public class UpdateSkillCommandHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context) : IRequestHandler<UpdateSkillCommand, Result<CareerSkillDto>>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result<CareerSkillDto>> Handle(UpdateSkillCommand request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<CareerSkillDto>(profileResult.Error);

        var profile = profileResult.Value;

        var skill = await _context.Skills.FirstOrDefaultAsync(s => s.Id == request.Id && s.ProfileId == profile.Id, ct);
        if (skill is null)
            return Error.NotFound("Skill.NotFound", $"Skill with ID '{request.Id}' was not found.");

        skill.Update(request.Name, request.Category);
        await _context.SaveChangesAsync(ct);

        return skill.ToDto();
    }
}

