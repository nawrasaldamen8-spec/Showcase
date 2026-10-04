using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Common.Interfaces;

public record StorageUsageTelemetry(
    long TotalCapacityBytes,
    long UsedBytes,
    int TotalFilesCount,
    long MonthlyBandwidthBytes,
    int RequestsCount,
    string PlanName,
    double CreditsUsedPercent,
    long ImagesBytes,
    long DocumentsBytes,
    long ThumbnailsBytes);

public interface IStorageService
{
    Task<string> GetPresignedUploadUrlAsync(string storageKey, string contentType, TimeSpan expiresIn, CancellationToken ct = default);
    string GetPublicUrl(string storageKey);
    Task DeleteAsync(string storageKey, CancellationToken ct = default);
    Task<StorageUsageTelemetry> GetUsageTelemetryAsync(CancellationToken ct = default);
    Task<Result<string>> SaveAsync(string storageKey, Stream contentStream, CancellationToken ct = default);
}
