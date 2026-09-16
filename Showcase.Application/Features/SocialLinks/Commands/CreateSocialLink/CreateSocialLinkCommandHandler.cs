using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities.SocialLink;
using Showcase.Domain.ValueObjects;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.SocialLinks.Commands.CreateSocialLink;

public class CreateSocialLinkCommandHandler : IRequestHandler<CreateSocialLinkCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    public CreateSocialLinkCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<Guid>> Handle(CreateSocialLinkCommand request, CancellationToken ct)
    {
        var urlRes = Url.Create(request.LinkUrl);
        if (urlRes.IsFailure) return urlRes.Error;

        var link = new SocialLink(request.ProfileId, request.Platform, urlRes.Value, request.DisplayOrder);
        _context.Set<SocialLink>().Add(link);
        await _context.SaveChangesAsync(ct);
        
        return link.Id;
    }
}
