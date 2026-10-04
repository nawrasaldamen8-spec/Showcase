using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Extensions;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Profiles.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.Profiles.Queries;



public record GetPublicProfileQuery(string Username) : IRequest<Result<PublicProfileResponse>>;



public class GetPublicProfileQueryHandler : IRequestHandler<GetPublicProfileQuery, Result<PublicProfileResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly IStorageService _storageService;

    public GetPublicProfileQueryHandler(
        IApplicationDbContext context,
        IIdentityService identityService,
        IStorageService storageService)
    {
        _context = context;
        _identityService = identityService;
        _storageService = storageService;
    }

    public async Task<Result<PublicProfileResponse>> Handle(GetPublicProfileQuery request, CancellationToken ct)
    {
        var userResult = await _identityService.GetUserByUsernameAsync(request.Username, ct);
        if (userResult.IsFailure)
        {
            return Result.Failure<PublicProfileResponse>(userResult.Error);
        }

        var user = userResult.Value;

        // Banned and soft-deleted accounts must not leak through the public profile route.
        var profile = await _context.Profiles
            .Include(p => p.SocialLinks)
            .WhereActive()
            .FirstOrDefaultAsync(p => p.UserId == user.Id, ct);

        if (profile is null)
        {
            return ProfileErrors.NotFoundForUser(user.Id);
        }

        return profile.ToPublicResponse(user.UserName, _storageService);
    }
}



public class GetPublicProfileQueryValidator : AbstractValidator<GetPublicProfileQuery>
{
    public GetPublicProfileQueryValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required.")
            .MaximumLength(50).WithMessage("Username cannot exceed 50 characters.");
    }
}

