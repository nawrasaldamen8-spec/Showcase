using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Showcase.Application.Common.Interfaces;

namespace Showcase.Infrastructure.Storage;

public class LocalStorageService : IStorageService
{
    private readonly string _uploadDirectory;
    private readonly string _publicUrlPrefix;

    public LocalStorageService(IWebHostEnvironment? env = null, IConfiguration? configuration = null)
    {
        var contentRoot = env?.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        _uploadDirectory = Path.Combine(contentRoot, "uploads");

        if (!Directory.Exists(_uploadDirectory))
        {
            Directory.CreateDirectory(_uploadDirectory);
        }

        var configuredPrefix = configuration?["LocalStorage:PublicUrlPrefix"];
        _publicUrlPrefix = !string.IsNullOrWhiteSpace(configuredPrefix)
            ? configuredPrefix.Trim().TrimEnd('/')
            : "/uploads";
    }

    public Task<string> GetPresignedUploadUrlAsync(
        string storageKey,
        string contentType,
        TimeSpan expiresIn,
        CancellationToken ct = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(storageKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(contentType);
        ArgumentOutOfRangeException.ThrowIfLessThanOrEqual(expiresIn, TimeSpan.Zero);

        ct.ThrowIfCancellationRequested();

        var normalizedKey = storageKey.Trim().Replace('\\', '/').TrimStart('/');
        if (string.IsNullOrEmpty(normalizedKey))
            throw new ArgumentException("Storage key cannot be empty.", nameof(storageKey));

        var url = $"/api/v1/storage/local-upload?key={Uri.EscapeDataString(normalizedKey)}";
        return Task.FromResult(url);
    }

    public string GetPublicUrl(string storageKey)
    {
        if (string.IsNullOrWhiteSpace(storageKey))
            return string.Empty;

        var normalizedKey = storageKey.Trim().Replace('\\', '/').TrimStart('/');
        if (string.IsNullOrEmpty(normalizedKey))
            return string.Empty;

        return $"{_publicUrlPrefix}/{normalizedKey}";
    }

    public Task DeleteAsync(string storageKey, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(storageKey))
            return Task.CompletedTask;

        ct.ThrowIfCancellationRequested();

        var normalizedKey = storageKey.Trim().Replace('\\', '/').TrimStart('/');
        if (string.IsNullOrEmpty(normalizedKey))
            return Task.CompletedTask;

        var filePath = Path.Combine(_uploadDirectory, normalizedKey);
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        return Task.CompletedTask;
    }

    public Task<StorageUsageTelemetry> GetUsageTelemetryAsync(CancellationToken ct = default)
    {
        long usedBytes = 0;
        int fileCount = 0;

        if (Directory.Exists(_uploadDirectory))
        {
            var files = Directory.GetFiles(_uploadDirectory, "*.*", SearchOption.AllDirectories);
            fileCount = files.Length;
            foreach (var file in files)
            {
                usedBytes += new FileInfo(file).Length;
            }
        }

        long capacityBytes = 10L * 1024 * 1024 * 1024; // 10 GB
        double creditPercent = capacityBytes > 0 ? (double)usedBytes / capacityBytes * 100.0 : 0.0;

        return Task.FromResult(new StorageUsageTelemetry(
            capacityBytes,
            usedBytes,
            fileCount,
            usedBytes / 2,
            fileCount * 3,
            "Local Disk",
            creditPercent,
            (long)(usedBytes * 0.7),
            (long)(usedBytes * 0.1),
            (long)(usedBytes * 0.2)));
    }
}

