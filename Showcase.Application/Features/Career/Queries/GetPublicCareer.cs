using Showcase.Application.Features.Career.Common;

namespace Showcase.Application.Features.Career.Queries;

using Showcase.Application.Features.Career.Common;

public record GetPublicCareerQuery(string? Username = null) : IRequest<Result<PublicCareerDataResponse>>;

public class GetPublicCareerQueryHandler(
    ICurrentUserService currentUserService,
    IIdentityService identityService,
    IApplicationDbContext context) : IRequestHandler<GetPublicCareerQuery, Result<PublicCareerDataResponse>>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IIdentityService _identityService = identityService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result<PublicCareerDataResponse>> Handle(GetPublicCareerQuery request, CancellationToken ct)
    {
        string? targetUserId = null;

        if (!string.IsNullOrWhiteSpace(request.Username))
        {
            var userResult = await _identityService.GetUserByUsernameAsync(request.Username, ct);
            if (userResult.IsFailure)
                return Result.Failure<PublicCareerDataResponse>(userResult.Error);
            targetUserId = userResult.Value.Id;
        }
        else
        {
            targetUserId = _currentUserService.UserId;
        }

        if (string.IsNullOrWhiteSpace(targetUserId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        var profile = await _context.Profiles
            .Include(p => p.Experiences)
            .Include(p => p.Academics)
            .Include(p => p.Skills)
            .Include(p => p.Credentials)
            .Include(p => p.Languages)
            .Include(p => p.Achievements)
            .Include(p => p.CareerVisibility)
            .FirstOrDefaultAsync(p => p.UserId == targetUserId && !p.IsBanned && !p.IsDeleted, ct);

        if (profile is null)
        {
            return new PublicCareerDataResponse(
                new List<CareerExperienceDto>(),
                new List<CareerAcademicDto>(),
                new List<CareerSkillDto>(),
                new List<CareerCredentialDto>(),
                new List<CareerLanguageDto>(),
                new List<CareerAchievementDto>(),
                new CareerVisibilityDto(true, true, true, true, true, true));
        }

        var vis = profile.CareerVisibility;
        if (vis is null)
        {
            vis = await _context.CareerVisibilities.FirstOrDefaultAsync(v => v.ProfileId == profile.Id, ct);
        }
        var visibilityDto = vis is not null
            ? new CareerVisibilityDto(vis.Experience, vis.Academics, vis.Skills, vis.Credentials, vis.Languages, vis.Achievements)
            : new CareerVisibilityDto(true, true, true, true, true, true);

        // Check if viewing own profile
        bool isOwnProfile = !string.IsNullOrEmpty(_currentUserService.UserId) && _currentUserService.UserId == targetUserId;

        var experiences = (isOwnProfile || visibilityDto.Experience)
            ? profile.Experiences
                .OrderByDescending(e => e.Period != null ? e.Period.Start : DateOnly.MinValue)
                .Select(e => e.ToDto())
                .ToList()
            : new List<CareerExperienceDto>();

        var academics = (isOwnProfile || visibilityDto.Academics)
            ? profile.Academics
                .OrderByDescending(a => a.Period != null ? a.Period.Start : DateOnly.MinValue)
                .Select(a => a.ToDto())
                .ToList()
            : new List<CareerAcademicDto>();

        var skills = (isOwnProfile || visibilityDto.Skills)
            ? profile.Skills
                .OrderBy(s => s.Name ?? string.Empty)
                .Select(s => s.ToDto())
                .ToList()
            : new List<CareerSkillDto>();

        var credentials = (isOwnProfile || visibilityDto.Credentials)
            ? profile.Credentials
                .OrderByDescending(c => c.Validity != null ? c.Validity.Start : DateOnly.MinValue)
                .Select(c => c.ToDto())
                .ToList()
            : new List<CareerCredentialDto>();

        var languages = (isOwnProfile || visibilityDto.Languages)
            ? profile.Languages
                .OrderBy(l => l.LanguageName ?? string.Empty)
                .Select(l => l.ToDto())
                .ToList()
            : new List<CareerLanguageDto>();

        var achievements = (isOwnProfile || visibilityDto.Achievements)
            ? profile.Achievements
                .OrderByDescending(a => a.Date ?? string.Empty)
                .Select(a => a.ToDto())
                .ToList()
            : new List<CareerAchievementDto>();

        return new PublicCareerDataResponse(
            experiences,
            academics,
            skills,
            credentials,
            languages,
            achievements,
            visibilityDto);
    }
}

