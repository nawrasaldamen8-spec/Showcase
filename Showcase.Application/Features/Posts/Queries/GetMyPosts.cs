using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Extensions;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Common.Models;
using Showcase.Application.Features.Posts.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Enums;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.Posts.Queries;



public record GetMyPostsQuery(
    PostStatus? Status = null,
    int PageNumber = 1,
    int PageSize = 10) : IRequest<Result<PaginatedList<PostSummaryResponse>>>, IPaginationRequest;



public class GetMyPostsQueryHandler : IRequestHandler<GetMyPostsQuery, Result<PaginatedList<PostSummaryResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;
    private readonly IStorageService _storageService;

    public GetMyPostsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IIdentityService identityService,
        IStorageService storageService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _identityService = identityService;
        _storageService = storageService;
    }

    public async Task<Result<PaginatedList<PostSummaryResponse>>> Handle(GetMyPostsQuery request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
        {
            return Result.Failure<PaginatedList<PostSummaryResponse>>(profileResult.Error);
        }

        var profile = profileResult.Value;

        var query = _context.Posts
            .Include(p => p.Images)
            .Include(p => p.PostTags)
                .ThenInclude(pt => pt.Tag)
            .Where(p => p.ProfileId == profile.Id);

        if (request.Status.HasValue)
        {
            query = query.Where(p => p.Status == request.Status.Value);
        }

        var pagedPosts = await query
            .OrderByDescending(p => p.CreatedAt)
            .ThenByDescending(p => p.Id)
            .ToPaginatedListAsync(request, ct);

        if (pagedPosts.TotalCount == 0)
        {
            return PaginatedList<PostSummaryResponse>.Empty(request.PageNumber, request.PageSize);
        }

        PostCreatorDto? creator = null;
        var userResult = await _identityService.GetUserByIdAsync(_currentUserService.UserId!, ct);
        if (userResult.IsSuccess)
        {
            var avatarUrl = profile.AvatarKey is not null
                ? _storageService.GetPublicUrl(profile.AvatarKey.Value)
                : null;

            creator = new PostCreatorDto(profile.Id, userResult.Value.UserName, profile.Name, avatarUrl);
        }

        var postIds = pagedPosts.Items.Select(p => p.Id).ToList();
        var likedPostIds = await _context.GetUserLikedPostIdsAsync(_currentUserService.UserId, postIds, ct);

        return pagedPosts.Map(post => post.ToSummaryResponse(_storageService, creator, likedPostIds.Contains(post.Id)));
    }
}



public class GetMyPostsQueryValidator : AbstractValidator<GetMyPostsQuery>
{
    public GetMyPostsQueryValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1).WithMessage("Page number must be at least 1.");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100).WithMessage("Page size must be between 1 and 100.");
    }
}

