using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Auth.Commands.ChangePassword;

public record ChangePasswordCommand(
    string CurrentPassword,
    string NewPassword) : IRequest<Result>;
