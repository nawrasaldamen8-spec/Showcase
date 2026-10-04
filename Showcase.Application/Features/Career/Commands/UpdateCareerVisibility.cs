using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Extensions;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Career.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Career.Commands;
using Showcase.Application.Features.Career.Common;

public record UpdateCareerVisibilityCommand(
    bool Experience,
    bool Academics,
    bool Skills,
    bool Credentials,
    bool Languages,
    bool Achievements) : IRequest<Result<CareerVisibilityDto>>;

public class UpdateCareerVisibilityCommandHandler : IRequestHandler<UpdateCareerVisibilityCommand, Result<CareerVisibilityDto>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public UpdateCareerVisibilityCommandHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result<CareerVisibilityDto>> Handle(UpdateCareerVisibilityCommand request, CancellationToken ct)
    {
        var profileResult = await _context.GetProfileWithCareerVisibilityAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<CareerVisibilityDto>(profileResult.Error);

        var profile = profileResult.Value;

        profile.UpdateVisibility(
            request.Experience,
            request.Academics,
            request.Skills,
            request.Credentials,
            request.Languages,
            request.Achievements);

        await _context.SaveChangesAsync(ct);

        return profile.CareerVisibility.ToDto();
    }
}

