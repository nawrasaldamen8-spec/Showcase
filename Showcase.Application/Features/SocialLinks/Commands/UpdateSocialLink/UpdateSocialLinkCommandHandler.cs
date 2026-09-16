using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities.SocialLink;
using Showcase.Domain.ValueObjects;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.SocialLinks.Commands.UpdateSocialLink;

public class UpdateSocialLinkCommandHandler : IRequestHandler<UpdateSocialLinkCommand, Result>
{
    private readonly IApplicationDbContext _context;
    public UpdateSocialLinkCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(UpdateSocialLinkCommand request, CancellationToken ct)
    {
        var link = await _context.Set<SocialLink>().FindAsync(new object[] { request.Id }, ct);
        if (link is null) return SocialLinkErrors.NotFound(request.Id);

        var urlRes = Url.Create(request.LinkUrl);
        if (urlRes.IsFailure) return urlRes.Error;

        link.Update(request.Platform, urlRes.Value);
        link.ChangeOrder(request.DisplayOrder);
        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}
