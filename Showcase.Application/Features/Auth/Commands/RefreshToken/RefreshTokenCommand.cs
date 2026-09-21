using MediatR;
using Showcase.Application.Features.Auth.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Auth.Commands.RefreshToken;

public record RefreshTokenCommand(
    string AccessToken,
    string RefreshToken) : IRequest<Result<AuthResponse>>;
