namespace Showcase.Application.Features.Profiles.Commands;



public record SubmitVerificationRequestCommand(
    string? Message = null,
    string? Notes = null,
    string? Category = null,
    string? IdentificationNumber = null,
    string? WebsiteUrl = null,
    string? PortfolioUrl = null,
    string? DocumentUrl = null) : IRequest<Result>;




public class SubmitVerificationRequestCommandHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context) : IRequestHandler<SubmitVerificationRequestCommand, Result>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result> Handle(SubmitVerificationRequestCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        var profile = await _context.Profiles
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);

        if (profile is null)
            return ProfileErrors.NotFoundForUser(userId);

        var requestResult = profile.RequestVerification();
        if (requestResult.IsFailure)
            return requestResult;

        var rawMessage = !string.IsNullOrWhiteSpace(request.Message)
            ? request.Message
            : (!string.IsNullOrWhiteSpace(request.Notes) ? request.Notes : "Requesting account verification badge.");
        var message = rawMessage.Trim();

        var verificationRequest = new VerificationRequest(
            userId,
            message,
            request.Category ?? "other",
            request.IdentificationNumber,
            request.WebsiteUrl,
            request.PortfolioUrl,
            request.DocumentUrl);
        _context.VerificationRequests.Add(verificationRequest);

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}

