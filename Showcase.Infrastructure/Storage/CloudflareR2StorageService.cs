using System;
using System.Threading;
using System.Threading.Tasks;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using Showcase.Application.Common.Interfaces;

namespace Showcase.Infrastructure.Storage;

public class CloudflareR2StorageService : IStorageService, IDisposable
{
    private readonly IAmazonS3 _s3Client;
    private readonly R2Settings _settings;
    private readonly bool _ownsClient;

    public CloudflareR2StorageService(IOptions<R2Settings> options)
    {
        ArgumentNullException.ThrowIfNull(options);
        _settings = options.Value ?? new R2Settings();
        var accountId = !string.IsNullOrWhiteSpace(_settings.AccountId)
            ? _settings.AccountId.Trim()
            : R2Settings.DefaultDummyAccountId;
        var accessKey = !string.IsNullOrWhiteSpace(_settings.AccessKeyId)
            ? _settings.AccessKeyId.Trim()
            : R2Settings.DefaultDummyAccessKey;
        var secretKey = !string.IsNullOrWhiteSpace(_settings.SecretAccessKey)
            ? _settings.SecretAccessKey.Trim()
            : R2Settings.DefaultDummySecretKey;

        var config = new AmazonS3Config
        {
            ServiceURL = $"https://{accountId}.r2.cloudflarestorage.com",
            AuthenticationRegion = "auto",
            ForcePathStyle = true
        };
        _s3Client = new AmazonS3Client(accessKey, secretKey, config);
        _ownsClient = true;
    }

    public CloudflareR2StorageService(IOptions<R2Settings> options, IAmazonS3 s3Client)
    {
        ArgumentNullException.ThrowIfNull(options);
        _settings = options.Value ?? new R2Settings();
        _s3Client = s3Client ?? throw new ArgumentNullException(nameof(s3Client));
        _ownsClient = false;
    }

    private bool _disposed;

    public Task<string> GetPresignedUploadUrlAsync(
        string storageKey,
        string contentType,
        TimeSpan expiresIn,
        CancellationToken ct = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(storageKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(contentType);
        ArgumentOutOfRangeException.ThrowIfLessThanOrEqual(expiresIn, TimeSpan.Zero);
        if (expiresIn > TimeSpan.FromDays(7))
            throw new ArgumentOutOfRangeException(nameof(expiresIn), "Presigned URL expiration cannot exceed 7 days (604800 seconds).");

        ct.ThrowIfCancellationRequested();

        var normalizedKey = storageKey.Trim().Replace('\\', '/').TrimStart('/');
        if (string.IsNullOrEmpty(normalizedKey))
            throw new ArgumentException("Storage key cannot be empty or consist only of slashes.", nameof(storageKey));

        var bucketName = !string.IsNullOrWhiteSpace(_settings.BucketName)
            ? _settings.BucketName.Trim()
            : R2Settings.DefaultDummyBucketName;

        var request = new GetPreSignedUrlRequest
        {
            BucketName = bucketName,
            Key = normalizedKey,
            Verb = HttpVerb.PUT,
            Expires = DateTime.UtcNow.Add(expiresIn),
            ContentType = contentType.Trim()
        };

        return _s3Client.GetPreSignedURLAsync(request);
    }

    public string GetPublicUrl(string storageKey)
    {
        if (string.IsNullOrWhiteSpace(storageKey))
            return string.Empty;

        var normalizedKey = storageKey.Trim().Replace('\\', '/').TrimStart('/');
        if (string.IsNullOrEmpty(normalizedKey))
            return string.Empty;

        var prefix = _settings.PublicUrlPrefix?.Trim().TrimEnd('/') ?? string.Empty;

        return string.IsNullOrEmpty(prefix)
            ? normalizedKey
            : $"{prefix}/{normalizedKey}";
    }

    public async Task DeleteAsync(string storageKey, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(storageKey))
            return;

        ct.ThrowIfCancellationRequested();

        var normalizedKey = storageKey.Trim().Replace('\\', '/').TrimStart('/');
        if (string.IsNullOrEmpty(normalizedKey))
            return;

        var bucketName = !string.IsNullOrWhiteSpace(_settings.BucketName)
            ? _settings.BucketName.Trim()
            : R2Settings.DefaultDummyBucketName;

        var request = new DeleteObjectRequest
        {
            BucketName = bucketName,
            Key = normalizedKey
        };

        await _s3Client.DeleteObjectAsync(request, ct);
    }

    public void Dispose()
    {
        if (_ownsClient && !_disposed)
        {
            _s3Client.Dispose();
            _disposed = true;
        }
        GC.SuppressFinalize(this);
    }
}
