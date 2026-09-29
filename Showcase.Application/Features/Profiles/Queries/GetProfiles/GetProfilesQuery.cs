using System.Collections.Generic;
using MediatR;
using Showcase.Application.Features.Profiles.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Profiles.Queries.GetProfiles;

public record GetProfilesQuery(string? Search = null) : IRequest<Result<IReadOnlyList<PublicProfileResponse>>>;
