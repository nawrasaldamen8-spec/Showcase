using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Extensions;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Common.Models;
using Showcase.Application.Features.Posts.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.Posts.Queries;



public record GetProfilePostsQuery(
    string Username,
    int PageNumber = 1,
    int PageSize = 12) : IRequest<Result<PaginatedList<PostSummaryResponse>>>, IPaginationRequest;



public class GetProfilePostsQueryHandler : IRequestHandler<GetProfilePostsQuery, Result<PaginatedList<PostSummaryResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly IStorageService _storageService;
    private readonly ICurrentUserService _currentUserService;

    public GetProfilePostsQueryHandler(
        IApplicationDbContext context,
        IIdentityService identityService,
        IStorageService storageService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _identityService = identityService;
        _storageService = storageService;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PaginatedList<PostSummaryResponse>>> Handle(GetProfilePostsQuery request, CancellationToken ct)
    {
        var userResult = await _identityService.GetUserByUsernameAsync(request.Username, ct);
        if (userResult.IsFailure)
        {
            return Result.Failure<PaginatedList<PostSummaryResponse>>(userResult.Error);
        }

        var user = userResult.Value;

        var profile = await _context.Profiles
            .FirstOrDefaultAsync(p => p.UserId == user.Id && !p.IsBanned && !p.IsDeleted, ct);

        if (profile is null)
        {
            return ProfileErrors.NotFoundForUser(user.Id);
        }

        var pagedPosts = await _context.Posts
            .Include(p => p.Images)
            .Include(p => p.PostTags)
                .ThenInclude(pt => pt.Tag)
            .AsPublished()
            .Where(p => p.ProfileId == profile.Id)
            .OrderByDescending(p => p.PublishedAt)
            .ThenByDescending(p => p.Id)
            .ToPaginatedListAsync(request, ct);

        if (pagedPosts.TotalCount == 0)
        {
            return PaginatedList<PostSummaryResponse>.Empty(request.PageNumber, request.PageSize);
        }

        var avatarUrl = profile.AvatarKey is not null
            ? _storageService.GetPublicUrl(profile.AvatarKey.Value)
            : null;

        var creator = new PostCreatorDto(profile.Id, user.UserName, profile.Name, avatarUrl);
        var postIds = pagedPosts.Items.Select(p => p.Id).ToList();
        var likedPostIds = await _context.GetUserLikedPostIdsAsync(_currentUserService.UserId, postIds, ct);

        return pagedPosts.Map(post => post.ToSummaryResponse(_storageService, creator, likedPostIds.Contains(post.Id)));
    }
}



public class GetProfilePostsQueryValidator : AbstractValidator<GetProfilePostsQuery>
{
    public GetProfilePostsQueryValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required.");

        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1).WithMessage("Page number must be at least 1.");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100).WithMessage("Page size must be between 1 and 100.");
    }
}

