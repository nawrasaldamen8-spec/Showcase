using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Extensions;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Career.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Career.Queries;
using Showcase.Application.Features.Career.Common;

public record GetCareerVisibilityQuery : IRequest<Result<CareerVisibilityDto>>;

public class GetCareerVisibilityQueryHandler : IRequestHandler<GetCareerVisibilityQuery, Result<CareerVisibilityDto>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public GetCareerVisibilityQueryHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result<CareerVisibilityDto>> Handle(GetCareerVisibilityQuery request, CancellationToken ct)
    {
        var profileResult = await _context.GetProfileWithCareerVisibilityAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<CareerVisibilityDto>(profileResult.Error);

        return profileResult.Value.CareerVisibility.ToDto();
    }
}

