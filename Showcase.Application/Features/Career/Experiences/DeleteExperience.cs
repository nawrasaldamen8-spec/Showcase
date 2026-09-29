using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Career.Experiences;

public record DeleteExperienceCommand(Guid Id) : IRequest<Result>;

public class DeleteExperienceCommandHandler : IRequestHandler<DeleteExperienceCommand, Result>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public DeleteExperienceCommandHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result> Handle(DeleteExperienceCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        var profile = await _context.Profiles
            .Include(p => p.Experiences)
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);

        if (profile is null)
            return ProfileErrors.NotFoundForUser(userId);

        var experience = profile.Experiences.FirstOrDefault(e => e.Id == request.Id);
        if (experience is null)
            return Error.NotFound("Experience.NotFound", $"Experience with ID '{request.Id}' was not found.");

        _context.Experiences.Remove(experience);
        await _context.SaveChangesAsync(ct);

        return Result.Success();
    }
}
