namespace Showcase.Application.Features.Career.Commands;

using Showcase.Application.Features.Career.Common;

public record DeleteAchievementCommand(Guid Id) : IRequest<Result>;

public class DeleteAchievementCommandHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context) : IRequestHandler<DeleteAchievementCommand, Result>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result> Handle(DeleteAchievementCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        var profile = await _context.Profiles
            .Include(p => p.Achievements)
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);

        if (profile is null)
            return ProfileErrors.NotFoundForUser(userId);

        var achievement = profile.Achievements.FirstOrDefault(a => a.Id == request.Id);
        if (achievement is null)
            return Error.NotFound("Achievement.NotFound", $"Achievement record with ID '{request.Id}' was not found.");

        _context.Achievements.Remove(achievement);
        await _context.SaveChangesAsync(ct);

        return Result.Success();
    }
}

