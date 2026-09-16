using MediatR;
using Showcase.Domain.Common.Results;
namespace Showcase.Application.Features.Profile.Queries.GetPublicProfile;

public record GetPublicProfileQuery : IRequest<Result<ProfileResponse>>;
