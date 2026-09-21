using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.SocialLinks.Commands.ReorderSocialLinks;

public class ReorderSocialLinksCommandHandler : IRequestHandler<ReorderSocialLinksCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ReorderSocialLinksCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(ReorderSocialLinksCommand request, CancellationToken ct)
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

        var dictionary = request.Items.ToDictionary(x => x.Id, x => x.DisplayOrder);
        profile.ReorderSocialLinks(dictionary);

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}
