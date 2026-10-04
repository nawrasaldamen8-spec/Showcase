using FluentValidation;
using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Auth.Common;
using Showcase.Domain.Common.Results;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.Auth.Commands;



public record ChangePasswordCommand(
    string CurrentPassword,
    string NewPassword) : IRequest<Result<AuthResponse>>;



public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Result<AuthResponse>>
{
    private readonly IIdentityService _identityService;
    private readonly ITokenService _tokenService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAuthCookieService? _authCookieService;

    public ChangePasswordCommandHandler(
        IIdentityService identityService,
        ITokenService tokenService,
        ICurrentUserService currentUserService,
        IAuthCookieService? authCookieService = null)
    {
        _identityService = identityService;
        _tokenService = tokenService;
        _currentUserService = currentUserService;
        _authCookieService = authCookieService;
    }

    public async Task<Result<AuthResponse>> Handle(ChangePasswordCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthorized", "User is not authenticated.");
        }

        var result = await _identityService.ChangePasswordAsync(
            userId,
            request.CurrentPassword,
            request.NewPassword,
            ct);

        if (result.IsFailure)
        {
            return Result.Failure<AuthResponse>(result.Error);
        }

        var userResult = await _identityService.GetUserByIdAsync(userId, ct);
        if (userResult.IsFailure)
        {
            return Result.Failure<AuthResponse>(userResult.Error);
        }

        var user = userResult.Value;
        var newAccessToken = _tokenService.GenerateAccessToken(user.Id, user.UserName, user.Email, user.Roles);
        var newRefreshToken = _tokenService.GenerateRefreshToken();

        await _identityService.UpdateRefreshTokenAsync(user.Id, newRefreshToken, DateTime.UtcNow.AddDays(7), ct);

        _authCookieService?.SetAuthCookies(newAccessToken, newRefreshToken);

        return new AuthResponse(newAccessToken, newRefreshToken);
    }
}



public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("Current password is required.");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("New password is required.")
            .MinimumLength(8).WithMessage("New password must be at least 8 characters long.")
            .Matches(@"[A-Z]").WithMessage("New password must contain at least one uppercase letter.")
            .Matches(@"[a-z]").WithMessage("New password must contain at least one lowercase letter.")
            .Matches(@"[0-9]").WithMessage("New password must contain at least one digit.")
            .Matches(@"[^a-zA-Z0-9]").WithMessage("New password must contain at least one non-alphanumeric character.")
            .NotEqual(x => x.CurrentPassword).WithMessage("New password cannot be the same as current password.");
    }
}

