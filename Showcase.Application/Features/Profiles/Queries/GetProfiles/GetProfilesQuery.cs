using MediatR;
using Showcase.Application.Common.Models;
using Showcase.Application.Features.Profiles.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Profiles.Queries.GetProfiles;

public record GetProfilesQuery(
    string? Search = null,
    int PageNumber = 1,
    int PageSize = 20) : IRequest<Result<PaginatedList<PublicProfileResponse>>>;
