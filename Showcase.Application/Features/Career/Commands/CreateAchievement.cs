using Showcase.Application.Features.Career.Common;

namespace Showcase.Application.Features.Career.Commands;

using Showcase.Application.Features.Career.Common;

public record CreateAchievementCommand(
    string Title,
    string? Type = null,
    string? Organization = null,
    string? Date = null,
    string? Url = null,
    string? MediaUrl = null,
    string? Description = null) : IRequest<Result<CareerAchievementDto>>;

public class CreateAchievementCommandValidator : AbstractValidator<CreateAchievementCommand>
{
    public CreateAchievementCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Achievement title is required.")
            .MaximumLength(150).WithMessage("Title must not exceed 150 characters.");
    }
}

public class CreateAchievementCommandHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context) : IRequestHandler<CreateAchievementCommand, Result<CareerAchievementDto>>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result<CareerAchievementDto>> Handle(CreateAchievementCommand request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<CareerAchievementDto>(profileResult.Error);

        var profile = profileResult.Value;

        Url? url = null;
        if (!string.IsNullOrWhiteSpace(request.Url))
        {
            var urlResult = Url.Create(request.Url);
            if (urlResult.IsFailure)
                return Result.Failure<CareerAchievementDto>(urlResult.Error);
            url = urlResult.Value;
        }

        StorageKey? mediaKey = null;
        if (!string.IsNullOrWhiteSpace(request.MediaUrl))
        {
            var keyResult = StorageKey.Create(request.MediaUrl);
            if (keyResult.IsSuccess)
                mediaKey = keyResult.Value;
        }

        var achievement = profile.AddAchievement(
            request.Title,
            request.Type,
            request.Organization,
            request.Date,
            url,
            mediaKey,
            request.Description);

        _context.Achievements.Add(achievement);
        await _context.SaveChangesAsync(ct);

        return achievement.ToDto();
    }
}

