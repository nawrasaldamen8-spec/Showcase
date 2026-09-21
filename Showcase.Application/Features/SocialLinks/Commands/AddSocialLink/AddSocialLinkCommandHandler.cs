using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Profiles.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;
using Showcase.Domain.ValueObjects;

namespace Showcase.Application.Features.SocialLinks.Commands.AddSocialLink;

public class AddSocialLinkCommandHandler : IRequestHandler<AddSocialLinkCommand, Result<SocialLinkDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public AddSocialLinkCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<SocialLinkDto>> Handle(AddSocialLinkCommand request, CancellationToken ct)
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
            return Result.Failure<SocialLinkDto>(urlResult.Error);
        }

        var link = profile.AddSocialLink(request.Platform, urlResult.Value, request.DisplayOrder);
        _context.SocialLinks.Add(link);
        await _context.SaveChangesAsync(ct);

        return new SocialLinkDto(link.Id, link.Platform, link.Url.Value, link.DisplayOrder);
    }
}
