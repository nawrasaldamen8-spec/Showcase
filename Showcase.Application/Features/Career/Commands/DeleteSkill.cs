namespace Showcase.Application.Features.Career.Commands;

using Showcase.Application.Features.Career.Common;

public record DeleteSkillCommand(Guid Id) : IRequest<Result>;

public class DeleteSkillCommandHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context) : IRequestHandler<DeleteSkillCommand, Result>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result> Handle(DeleteSkillCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        var profile = await _context.Profiles
            .Include(p => p.Skills)
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);

        if (profile is null)
            return ProfileErrors.NotFoundForUser(userId);

        var skill = profile.Skills.FirstOrDefault(s => s.Id == request.Id);
        if (skill is null)
            return Error.NotFound("Skill.NotFound", $"Skill with ID '{request.Id}' was not found.");

        _context.Skills.Remove(skill);
        await _context.SaveChangesAsync(ct);

        return Result.Success();
    }
}

