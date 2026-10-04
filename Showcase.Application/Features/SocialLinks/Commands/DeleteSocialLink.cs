using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.SocialLinks.Commands;



public record DeleteSocialLinkCommand(Guid Id) : IRequest<Result>;



public class DeleteSocialLinkCommandHandler : IRequestHandler<DeleteSocialLinkCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DeleteSocialLinkCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(DeleteSocialLinkCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthorized", "User is not authenticated.");
        }

        var profile = await _context.Profiles
            .Include(p => p.SocialLinks)
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);

        if (profile is null)
        {
            return ProfileErrors.NotFoundForUser(userId);
        }

        var removeResult = profile.RemoveSocialLink(request.Id);
        if (removeResult.IsFailure)
        {
            return removeResult;
        }

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}

