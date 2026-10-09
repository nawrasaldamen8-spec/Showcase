namespace Showcase.Application.Features.Profiles.Commands;



public record SubmitFeaturedRequestCommand(string? Message = null, string? Notes = null) : IRequest<Result>;



public class SubmitFeaturedRequestCommandHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context) : IRequestHandler<SubmitFeaturedRequestCommand, Result>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result> Handle(SubmitFeaturedRequestCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        var profile = await _context.Profiles
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);

        if (profile is null)
            return ProfileErrors.NotFoundForUser(userId);

        if (profile.FeaturedStatus == FeaturedStatus.Pending)
            return FeaturedRequestErrors.AlreadyPending;

        var transitionResult = profile.SetFeaturedStatus(FeaturedStatus.Pending);
        if (transitionResult.IsFailure)
            return transitionResult;

        var rawMessage = !string.IsNullOrWhiteSpace(request.Message)
            ? request.Message
            : (!string.IsNullOrWhiteSpace(request.Notes) ? request.Notes : "Requesting featured creator status.");
        var message = rawMessage.Trim();
        var featuredRequest = new FeaturedRequest(userId, message);
        _context.FeaturedRequests.Add(featuredRequest);

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}

