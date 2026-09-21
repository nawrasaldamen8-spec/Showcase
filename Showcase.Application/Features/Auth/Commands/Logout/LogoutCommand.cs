using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Auth.Commands.Logout;

public record LogoutCommand : IRequest<Result>;
