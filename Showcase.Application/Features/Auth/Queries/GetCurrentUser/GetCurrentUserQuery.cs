using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Auth.Queries.GetCurrentUser;

public record GetCurrentUserQuery : IRequest<Result<CurrentUserResponse>>;
