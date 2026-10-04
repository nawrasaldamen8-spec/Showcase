using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Career.Commands;
using Showcase.Application.Features.Career.Common;

public record DeleteAcademicCommand(Guid Id) : IRequest<Result>;

public class DeleteAcademicCommandHandler : IRequestHandler<DeleteAcademicCommand, Result>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public DeleteAcademicCommandHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result> Handle(DeleteAcademicCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        var profile = await _context.Profiles
            .Include(p => p.Academics)
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);

        if (profile is null)
            return ProfileErrors.NotFoundForUser(userId);

        var academic = profile.Academics.FirstOrDefault(a => a.Id == request.Id);
        if (academic is null)
            return Error.NotFound("Academic.NotFound", $"Academic record with ID '{request.Id}' was not found.");

        _context.Academics.Remove(academic);
        await _context.SaveChangesAsync(ct);

        return Result.Success();
    }
}

