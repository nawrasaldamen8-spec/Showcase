using MediatR;
using Showcase.Application.Features.Profiles.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Profiles.Queries.GetMyProfile;

public record GetMyProfileQuery : IRequest<Result<MyProfileResponse>>;
