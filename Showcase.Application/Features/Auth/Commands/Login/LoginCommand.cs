using MediatR;
using Showcase.Application.Features.Auth.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Auth.Commands.Login;

public record LoginCommand(
    string EmailOrUsername,
    string Password) : IRequest<Result<AuthResponse>>;
