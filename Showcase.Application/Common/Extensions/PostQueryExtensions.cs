using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Posts.Common;
using Showcase.Domain.Entities;
using Showcase.Domain.Enums;

namespace Showcase.Application.Common.Extensions;

public static class PostQueryExtensions
{
    public static IQueryable<Post> AsPublished(this IQueryable<Post> query)
    {
        return query.Where(p => p.Status == PostStatus.Published);
    }

    public static IQueryable<Post> Search(this IQueryable<Post> query, string? term)
    {
        if (string.IsNullOrWhiteSpace(term))
            return query;

        var search = term.Trim().ToLower();
        return query.Where(p => p.Title.ToLower().Contains(search) || p.Description.ToLower().Contains(search));
    }

    public static IQueryable<Guid> GetExploreFeaturedCreatorIds(this IApplicationDbContext context)
    {
        return context.Profiles
            .Where(p => !p.IsBanned && !p.IsDeleted && p.FeaturedStatus == FeaturedStatus.Featured)
            .Select(p => p.Id);
    }

    public static async Task<HashSet<Guid>> GetUserLikedPostIdsAsync(
        this IApplicationDbContext context,
        string? userId,
        IReadOnlyCollection<Guid> postIds,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(userId) || postIds.Count == 0)
            return new HashSet<Guid>();

        var likedIds = await context.PostLikes
            .Where(l => postIds.Contains(l.PostId) && l.UserId == userId)
            .Select(l => l.PostId)
            .ToListAsync(ct);

        return new HashSet<Guid>(likedIds);
    }

    public static async Task<Dictionary<Guid, PostCreatorDto>> GetPostCreatorsAsync(
        this IApplicationDbContext context,
        IIdentityService identityService,
        IStorageService storageService,
        IReadOnlyCollection<Guid> profileIds,
        CancellationToken ct = default)
    {
        if (profileIds.Count == 0)
            return new Dictionary<Guid, PostCreatorDto>();

        var profiles = await context.Profiles
            .Where(p => profileIds.Contains(p.Id))
            .ToListAsync(ct);

        var userIds = profiles.Select(p => p.UserId).Distinct().ToList();
        var usersResult = await identityService.GetUsersByIdsAsync(userIds, ct);
        var usersDict = usersResult?.IsSuccess == true ? usersResult.Value : new Dictionary<string, UserIdentityDetails>();

        var creatorMap = new Dictionary<Guid, PostCreatorDto>();
        foreach (var profile in profiles)
        {
            if (!usersDict.TryGetValue(profile.UserId, out var userDetails))
            {
                var individualUser = await identityService.GetUserByIdAsync(profile.UserId, ct);
                if (individualUser?.IsSuccess == true)
                {
                    userDetails = individualUser.Value;
                }
            }

            if (userDetails is not null)
            {
                var avatarUrl = profile.AvatarKey is not null
                    ? storageService.GetPublicUrl(profile.AvatarKey.Value)
                    : null;

                creatorMap[profile.Id] = new PostCreatorDto(
                    profile.Id,
                    userDetails.UserName,
                    profile.Name,
                    avatarUrl);
            }
        }

        return creatorMap;
    }

    public static PostSummaryResponse ToSummaryResponse(
        this Post post,
        IStorageService storageService,
        PostCreatorDto? creator,
        bool isLiked)
    {
        var firstImage = post.Images.OrderBy(i => i.DisplayOrder).FirstOrDefault();
        var thumbnailUrl = firstImage is not null
            ? storageService.GetPublicUrl(firstImage.StorageKey.Value)
            : null;

        var tags = post.PostTags
            .Where(pt => pt.Tag != null)
            .Select(pt => pt.Tag.Name)
            .ToList();

        return new PostSummaryResponse(
            post.Id,
            post.ProfileId,
            post.Title,
            post.Description,
            post.ExternalUrl?.Value,
            post.Status.ToString(),
            post.CreatedAt,
            post.PublishedAt,
            thumbnailUrl,
            post.Images.Count,
            tags,
            creator,
            post.LikesCount,
            isLiked);
    }
}
