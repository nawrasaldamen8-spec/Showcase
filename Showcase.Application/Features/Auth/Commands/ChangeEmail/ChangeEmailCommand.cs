using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Auth.Commands.ChangeEmail;

public record ChangeEmailCommand(
    string NewEmail,
    string CurrentPassword) : IRequest<Result>;
