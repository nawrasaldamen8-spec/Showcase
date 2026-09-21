using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;
using Showcase.Domain.ValueObjects;

namespace Showcase.Application.Features.Profiles.Commands.UpdateProfile;

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateProfileCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(UpdateProfileCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthorized", "User is not authenticated.");
        }

        var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserId == userId, ct);
        if (profile is null)
        {
            return ProfileErrors.NotFoundForUser(userId);
        }

        var bioResult = Bio.CreateOptional(request.Bio);
        if (bioResult.IsFailure)
        {
            return Result.Failure(bioResult.Error);
        }

        profile.UpdateDetails(request.FirstName, request.LastName, bioResult.Value);
        await _context.SaveChangesAsync(ct);

        return Result.Success();
    }
}
