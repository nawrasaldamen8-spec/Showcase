using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities.Profile;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.Profile.Queries.GetPublicProfile;

public class GetPublicProfileQueryHandler : IRequestHandler<GetPublicProfileQuery, Result<ProfileResponse>>
{
    private readonly IApplicationDbContext _context;
    public GetPublicProfileQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<ProfileResponse>> Handle(GetPublicProfileQuery request, CancellationToken ct)
    {
        var profile = await _context.Set<Showcase.Domain.Entities.Profile.Profile>()
            .AsNoTracking()
            .Select(p => new ProfileResponse(
                p.Id, 
                p.Name, 
                p.Title, 
                p.Bio, 
                p.ProfileImageUrl != null ? p.ProfileImageUrl.Value : null, 
                p.Location))
            .FirstOrDefaultAsync(ct);

        if (profile is null)
            return ProfileErrors.NotFound;

        return profile;
    }
}
