using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Auth.Commands.ChangeUsername;

public record ChangeUsernameCommand(
    string NewUsername,
    string CurrentPassword) : IRequest<Result>;
