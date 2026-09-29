using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Auth.Queries.CheckUsername;

public record CheckUsernameQuery(string Username) : IRequest<Result<CheckUsernameResponse>>;
