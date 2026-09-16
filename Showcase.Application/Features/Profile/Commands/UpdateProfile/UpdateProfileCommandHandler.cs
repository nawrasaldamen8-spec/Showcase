using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities.Profile;
using Showcase.Domain.ValueObjects;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.Profile.Commands.UpdateProfile;

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, Result>
{
    private readonly IApplicationDbContext _context;
    public UpdateProfileCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(UpdateProfileCommand request, CancellationToken ct)
    {
        var profile = await _context.Set<Showcase.Domain.Entities.Profile.Profile>().FirstOrDefaultAsync(ct);
        if (profile is null) return ProfileErrors.NotFound;

        Url? url = null;
        if (!string.IsNullOrWhiteSpace(request.ProfileImageUrl))
        {
            var urlResult = Url.Create(request.ProfileImageUrl);
            if (urlResult.IsFailure) return urlResult.Error;
            url = urlResult.Value;
        }

        profile.UpdateProfile(request.Name, request.Title, request.Bio, url, request.Location);
        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}
