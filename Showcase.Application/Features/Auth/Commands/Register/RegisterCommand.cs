using MediatR;
using Showcase.Application.Features.Auth.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Auth.Commands.Register;

public record RegisterCommand(
    string Username,
    string Password,
    string Name,
    string? Email = null,
    string? Bio = null) : IRequest<Result<AuthResponse>>;
