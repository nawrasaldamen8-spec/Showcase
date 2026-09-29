using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Career.Credentials;

public record DeleteCredentialCommand(Guid Id) : IRequest<Result>;

public class DeleteCredentialCommandHandler : IRequestHandler<DeleteCredentialCommand, Result>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public DeleteCredentialCommandHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result> Handle(DeleteCredentialCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        var profile = await _context.Profiles
            .Include(p => p.Credentials)
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);

        if (profile is null)
            return ProfileErrors.NotFoundForUser(userId);

        var credential = profile.Credentials.FirstOrDefault(c => c.Id == request.Id);
        if (credential is null)
            return Error.NotFound("Credential.NotFound", $"Credential with ID '{request.Id}' was not found.");

        _context.Credentials.Remove(credential);
        await _context.SaveChangesAsync(ct);

        return Result.Success();
    }
}
