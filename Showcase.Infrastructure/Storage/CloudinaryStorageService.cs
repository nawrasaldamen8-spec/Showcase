using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;

namespace Showcase.Infrastructure.Storage;

public class CloudinaryStorageService : IStorageService
{
    private readonly Cloudinary _cloudinary;
    private readonly CloudinarySettings _settings;
    private readonly ILogger<CloudinaryStorageService> _logger;

    public CloudinaryStorageService(
        IOptions<CloudinarySettings> options,
        ILogger<CloudinaryStorageService> logger)
    {
        ArgumentNullException.ThrowIfNull(options);
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _settings = options.Value ?? new CloudinarySettings();

        var account = new Account(
            _settings.CloudName,
            _settings.ApiKey,
            _settings.ApiSecret);

        _cloudinary = new Cloudinary(account);
        _cloudinary.Api.Secure = true;
    }

    public Task<string> GetPresignedUploadUrlAsync(
        string storageKey,
        string contentType,
        TimeSpan expiresIn,
        CancellationToken ct = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(storageKey);
        ct.ThrowIfCancellationRequested();

        var normalizedKey = storageKey.Trim().Replace('\\', '/').TrimStart('/');

        // Strip extension from public_id if present for Cloudinary standard public_id management
        var dotIndex = normalizedKey.LastIndexOf('.');
        var publicId = dotIndex > 0 ? normalizedKey[..dotIndex] : normalizedKey;

        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();

        // If UploadPreset is provided, use Unsigned direct upload (avoids API Key permission restrictions)
        if (!string.IsNullOrWhiteSpace(_settings.UploadPreset))
        {
            var uploadUrl = $"https://api.cloudinary.com/v1_1/{Uri.EscapeDataString(_settings.CloudName)}/image/upload?upload_preset={Uri.EscapeDataString(_settings.UploadPreset)}&public_id={Uri.EscapeDataString(publicId)}";
            return Task.FromResult(uploadUrl);
        }

        // Otherwise fallback to SHA1-signed upload parameters
        var parameters = new SortedDictionary<string, object>
        {
            { "public_id", publicId },
            { "timestamp", timestamp }
        };

        var signature = _cloudinary.Api.SignParameters(parameters);
        var queryString = $"public_id={Uri.EscapeDataString(publicId)}&timestamp={timestamp}&api_key={Uri.EscapeDataString(_settings.ApiKey)}&signature={Uri.EscapeDataString(signature)}";
        var signedUploadUrl = $"https://api.cloudinary.com/v1_1/{Uri.EscapeDataString(_settings.CloudName)}/image/upload?{queryString}";

        return Task.FromResult(signedUploadUrl);
    }

    public string GetPublicUrl(string storageKey)
    {
        if (string.IsNullOrWhiteSpace(storageKey))
            return string.Empty;

        var normalizedKey = storageKey.Trim().Replace('\\', '/').TrimStart('/');
        if (string.IsNullOrEmpty(normalizedKey))
            return string.Empty;

        if (normalizedKey.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            normalizedKey.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            return normalizedKey;
        }

        return $"https://res.cloudinary.com/{_settings.CloudName}/image/upload/f_auto,q_auto/{normalizedKey}";
    }

    public async Task DeleteAsync(string storageKey, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(storageKey))
            return;

        ct.ThrowIfCancellationRequested();

        var normalizedKey = storageKey.Trim().Replace('\\', '/').TrimStart('/');
        var dotIndex = normalizedKey.LastIndexOf('.');
        var publicId = dotIndex > 0 ? normalizedKey[..dotIndex] : normalizedKey;

        var deletionParams = new DeletionParams(publicId)
        {
            ResourceType = ResourceType.Image
        };

        var result = await _cloudinary.DestroyAsync(deletionParams);
        if (result is not null && !string.Equals(result.Result, "ok", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Cloudinary asset deletion returned unexpected result '{Result}' for publicId '{PublicId}'. Error: {Error}",
                result.Result, publicId, result.Error?.Message);
        }
    }

    public async Task<StorageUsageTelemetry> GetUsageTelemetryAsync(CancellationToken ct = default)
    {
        try
        {
            var usage = await _cloudinary.GetUsageAsync(ct);
            if (usage is not null && usage.StatusCode == System.Net.HttpStatusCode.OK)
            {
                long usedBytes = usage.Storage?.Used ?? 0L;
                long totalCapacity = usage.Storage?.Limit > 0
                    ? usage.Storage.Limit
                    : 25L * 1024 * 1024 * 1024; // 25 GB default Free Tier

                long bandwidthBytes = usage.Bandwidth?.Used ?? 0L;
                int totalObjects = (int)(usage.Objects?.Used ?? 0L);
                int transformations = (int)(usage.Transformations?.Used ?? 0L);
                string plan = string.IsNullOrWhiteSpace(usage.Plan) ? "Free Tier" : usage.Plan;
                double creditsPercent = (double)(usage.Credits?.UsedPercent ?? 0f);

                long imagesBytes = (long)(usedBytes * 0.85);
                long thumbnailsBytes = usedBytes - imagesBytes;

                return new StorageUsageTelemetry(
                    totalCapacity,
                    usedBytes,
                    totalObjects,
                    bandwidthBytes,
                    transformations,
                    plan,
                    creditsPercent,
                    imagesBytes,
                    0L,
                    thumbnailsBytes);
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Cloudinary usage query fallback: {ex.Message}");
        }

        // Fallback default free tier telemetry
        long fallbackCapacity = 25L * 1024 * 1024 * 1024;
        return new StorageUsageTelemetry(
            fallbackCapacity,
            0L,
            0,
            0L,
            0,
            "Free Tier",
            0.0,
            0L,
            0L,
            0L);
    }

    public Task<Result<string>> SaveAsync(string storageKey, System.IO.Stream contentStream, CancellationToken ct = default)
    {
        return Task.FromResult(Result.Failure<string>(
            Showcase.Domain.Common.Results.Error.Failure("Storage.LocalDisabled", "Local upload is not available in this environment.")));
    }
}

