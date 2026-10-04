using FluentValidation;
using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Auth.Common;
using Showcase.Domain.Common.Results;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.Auth.Commands;



public record ChangeUsernameCommand(
    string NewUsername,
    string CurrentPassword) : IRequest<Result<AuthResponse>>;



public class ChangeUsernameCommandHandler : IRequestHandler<ChangeUsernameCommand, Result<AuthResponse>>
{
    private readonly IIdentityService _identityService;
    private readonly ITokenService _tokenService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAuthCookieService? _authCookieService;

    public ChangeUsernameCommandHandler(
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

    public async Task<Result<AuthResponse>> Handle(ChangeUsernameCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthorized", "User is not authenticated.");
        }

        var result = await _identityService.ChangeUsernameAsync(
            userId,
            request.NewUsername,
            request.CurrentPassword,
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



public class ChangeUsernameCommandValidator : AbstractValidator<ChangeUsernameCommand>
{
    public ChangeUsernameCommandValidator()
    {
        RuleFor(x => x.NewUsername)
            .NotEmpty().WithMessage("New username is required.")
            .MinimumLength(3).WithMessage("New username must be at least 3 characters long.")
            .MaximumLength(30).WithMessage("New username cannot exceed 30 characters.")
            .Matches(@"^[a-zA-Z0-9_-]+$").WithMessage("New username can only contain letters, numbers, underscores, and dashes.");

        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("Current password is required.");
    }
}

