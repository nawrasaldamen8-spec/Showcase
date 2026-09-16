using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities.SocialLink;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.SocialLinks.Commands.DeleteSocialLink;

public class DeleteSocialLinkCommandHandler : IRequestHandler<DeleteSocialLinkCommand, Result>
{
    private readonly IApplicationDbContext _context;
    public DeleteSocialLinkCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(DeleteSocialLinkCommand request, CancellationToken ct)
    {
        var link = await _context.Set<SocialLink>().FindAsync(new object[] { request.Id }, ct);
        if (link is null) return SocialLinkErrors.NotFound(request.Id);
        
        _context.Set<SocialLink>().Remove(link);
        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}
