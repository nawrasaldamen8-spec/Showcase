using MediatR;
using Showcase.Application.Features.Auth.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Auth.Commands.Register;

public record RegisterCommand(
    string Email,
    string Username,
    string Password,
    string FirstName,
    string LastName) : IRequest<Result<AuthResponse>>;
