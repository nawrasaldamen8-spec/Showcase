using System.Collections.Generic;
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

    public GetStorageTelemetryQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<StorageTelemetryDto>> Handle(GetStorageTelemetryQuery request, CancellationToken ct)
    {
        var postImagesCount = await _context.PostImages.CountAsync(ct);
        var avatarsCount = await _context.Profiles.CountAsync(p => p.AvatarKey != null, ct);
        var totalObjects = postImagesCount + avatarsCount;

        long postImagesBytes = postImagesCount * 850_000L;
        long avatarsBytes = avatarsCount * 250_000L;
        long totalUsedBytes = postImagesBytes + avatarsBytes;
        long quotaBytes = 50L * 1024 * 1024 * 1024; // 50 GB

        var buckets = new List<StorageBucketBreakdownDto>
        {
            new("showcase-images", postImagesBytes, postImagesCount),
            new("showcase-avatars", avatarsBytes, avatarsCount)
        };

        return new StorageTelemetryDto(
            totalUsedBytes,
            quotaBytes,
            totalObjects,
            buckets);
    }
}
