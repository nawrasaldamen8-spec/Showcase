namespace Showcase.Application.Features.Auth.Commands;

public record DeleteAccountCommand(string Password) : IRequest<Result>;

public class DeleteAccountCommandHandler(
    IApplicationDbContext context,
    IIdentityService identityService,
    ICurrentUserService currentUserService,
    IAuthCookieService? authCookieService = null) : IRequestHandler<DeleteAccountCommand, Result>
{
    private readonly IApplicationDbContext _context = context;
    private readonly IIdentityService _identityService = identityService;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IAuthCookieService? _authCookieService = authCookieService;

    public async Task<Result> Handle(DeleteAccountCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthorized", "User is not authenticated.");
        }

        var verifyResult = await _identityService.VerifyPasswordAsync(userId, request.Password, ct);
        if (verifyResult.IsFailure)
        {
            return verifyResult;
        }

        var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserId == userId, ct);
        if (profile is null)
        {
            return Error.NotFound("Profile.NotFound", "User profile was not found.");
        }

        profile.SoftDelete();
        await _identityService.RevokeRefreshTokenAsync(userId, ct);
        _authCookieService?.ClearAuthCookies();

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}

public class DeleteAccountCommandValidator : AbstractValidator<DeleteAccountCommand>
{
    public DeleteAccountCommandValidator()
    {
        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required to delete the account.");
    }
}
