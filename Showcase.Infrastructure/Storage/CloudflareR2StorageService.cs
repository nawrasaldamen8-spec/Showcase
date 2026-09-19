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
        _settings = options.Value;
        var config = new AmazonS3Config
        {
            ServiceURL = $"https://{_settings.AccountId}.r2.cloudflarestorage.com"
        };
        _s3Client = new AmazonS3Client(_settings.AccessKeyId, _settings.SecretAccessKey, config);
        _ownsClient = true;
    }

    public CloudflareR2StorageService(IOptions<R2Settings> options, IAmazonS3 s3Client)
    {
        _settings = options.Value;
        _s3Client = s3Client;
        _ownsClient = false;
    }

    public Task<string> GetPresignedUploadUrlAsync(
        string storageKey,
        string contentType,
        TimeSpan expiresIn,
        CancellationToken ct = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(storageKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(contentType);

        var request = new GetPreSignedUrlRequest
        {
            BucketName = _settings.BucketName,
            Key = storageKey,
            Verb = HttpVerb.PUT,
            Expires = DateTime.UtcNow.Add(expiresIn),
            ContentType = contentType
        };

        return _s3Client.GetPreSignedURLAsync(request);
    }

    public string GetPublicUrl(string storageKey)
    {
        if (string.IsNullOrWhiteSpace(storageKey))
            return string.Empty;

        var prefix = _settings.PublicUrlPrefix.TrimEnd('/');
        var key = storageKey.TrimStart('/');
        return $"{prefix}/{key}";
    }

    public async Task DeleteAsync(string storageKey, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(storageKey))
            return;

        var request = new DeleteObjectRequest
        {
            BucketName = _settings.BucketName,
            Key = storageKey
        };

        await _s3Client.DeleteObjectAsync(request, ct);
    }

    public void Dispose()
    {
        if (_ownsClient)
        {
            _s3Client.Dispose();
        }
        GC.SuppressFinalize(this);
    }
}
