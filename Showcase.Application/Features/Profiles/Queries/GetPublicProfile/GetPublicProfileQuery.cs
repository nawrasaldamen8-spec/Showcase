using MediatR;
using Showcase.Application.Features.Profiles.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Profiles.Queries.GetPublicProfile;

public record GetPublicProfileQuery(string Username) : IRequest<Result<PublicProfileResponse>>;
