using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;
using Showcase.Domain.ValueObjects;

namespace Showcase.Application.Features.SocialLinks.Commands.UpdateSocialLink;

public class UpdateSocialLinkCommandHandler : IRequestHandler<UpdateSocialLinkCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateSocialLinkCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(UpdateSocialLinkCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthorized", "User is not authenticated.");
        }

        var profile = await _context.Profiles
            .Include(p => p.SocialLinks)
            .FirstOrDefaultAsync(p => p.UserId == userId, ct);

        if (profile is null)
        {
            return ProfileErrors.NotFoundForUser(userId);
        }

        var urlResult = Url.Create(request.Url);
        if (urlResult.IsFailure)
        {
            return Result.Failure(urlResult.Error);
        }

        var updateResult = profile.UpdateSocialLink(request.Id, request.Platform, urlResult.Value);
        if (updateResult.IsFailure)
        {
            return updateResult;
        }

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}
