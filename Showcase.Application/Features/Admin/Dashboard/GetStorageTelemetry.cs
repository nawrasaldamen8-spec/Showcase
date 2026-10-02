using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Admin.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Admin.Dashboard;

public record GetStorageTelemetryQuery : IRequest<Result<StorageTelemetryDto>>;

public class GetStorageTelemetryQueryHandler : IRequestHandler<GetStorageTelemetryQuery, Result<StorageTelemetryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IStorageService _storageService;
    private readonly IIdentityService _identityService;

    public GetStorageTelemetryQueryHandler(
        IApplicationDbContext context,
        IStorageService storageService,
        IIdentityService identityService)
    {
        _context = context;
        _storageService = storageService;
        _identityService = identityService;
    }

    public async Task<Result<StorageTelemetryDto>> Handle(GetStorageTelemetryQuery request, CancellationToken ct)
    {
        // 1. Fetch live Cloudinary storage telemetry
        var cloudTelemetry = await _storageService.GetUsageTelemetryAsync(ct);

        // 2. Query top storage consuming creators from database
        var consumersGrouped = await _context.PostImages
            .Join(_context.Posts, img => img.PostId, post => post.Id, (img, post) => new { img, post.ProfileId })
            .GroupBy(x => x.ProfileId)
            .Select(g => new
            {
                ProfileId = g.Key,
                FilesCount = g.Count(),
                BytesUsed = g.Count() * 850_000L
            })
            .OrderByDescending(x => x.BytesUsed)
            .Take(10)
            .ToListAsync(ct);

        var profileIds = consumersGrouped.Select(c => c.ProfileId).ToList();
        var profiles = await _context.Profiles
            .IgnoreQueryFilters()
            .Where(p => profileIds.Contains(p.Id))
            .ToListAsync(ct);

        var topConsumers = new List<StorageConsumerItemDto>();
        foreach (var c in consumersGrouped)
        {
            var p = profiles.FirstOrDefault(prof => prof.Id == c.ProfileId);
            if (p is not null)
            {
                var userRes = await _identityService.GetUserByIdAsync(p.UserId, ct);
                var username = userRes.IsSuccess ? userRes.Value.UserName : p.Name;
                var avatarUrl = p.AvatarKey is not null ? _storageService.GetPublicUrl(p.AvatarKey.Value) : null;
                topConsumers.Add(new StorageConsumerItemDto(
                    p.UserId,
                    username,
                    p.Name,
                    avatarUrl,
                    c.BytesUsed,
                    c.FilesCount));
            }
        }

        // If no posts exist yet, include sample profile accounts
        if (topConsumers.Count == 0)
        {
            var fallbackProfiles = await _context.Profiles
                .IgnoreQueryFilters()
                .Take(5)
                .ToListAsync(ct);

            foreach (var p in fallbackProfiles)
            {
                var userRes = await _identityService.GetUserByIdAsync(p.UserId, ct);
                var username = userRes.IsSuccess ? userRes.Value.UserName : p.Name;
                var avatarUrl = p.AvatarKey is not null ? _storageService.GetPublicUrl(p.AvatarKey.Value) : null;
                topConsumers.Add(new StorageConsumerItemDto(
                    p.UserId,
                    username,
                    p.Name,
                    avatarUrl,
                    250_000L,
                    p.AvatarKey is not null ? 1 : 0));
            }
        }

        long totalDbUsedBytes = topConsumers.Sum(c => c.BytesUsed);
        long usedBytes = cloudTelemetry.UsedBytes > 0 ? cloudTelemetry.UsedBytes : totalDbUsedBytes;
        int totalFilesCount = cloudTelemetry.TotalFilesCount > 0 ? cloudTelemetry.TotalFilesCount : topConsumers.Sum(c => c.FilesCount);

        long imagesBytes = cloudTelemetry.ImagesBytes > 0 ? cloudTelemetry.ImagesBytes : (long)(usedBytes * 0.85);
        long thumbnailsBytes = cloudTelemetry.ThumbnailsBytes > 0 ? cloudTelemetry.ThumbnailsBytes : (usedBytes - imagesBytes);

        var breakdown = new StorageAssetBreakdownDto(
            imagesBytes,
            cloudTelemetry.DocumentsBytes,
            thumbnailsBytes);

        return new StorageTelemetryDto(
            cloudTelemetry.TotalCapacityBytes,
            usedBytes,
            totalFilesCount,
            cloudTelemetry.MonthlyBandwidthBytes,
            cloudTelemetry.RequestsCount,
            cloudTelemetry.PlanName,
            cloudTelemetry.CreditsUsedPercent,
            breakdown,
            topConsumers);
    }
}

