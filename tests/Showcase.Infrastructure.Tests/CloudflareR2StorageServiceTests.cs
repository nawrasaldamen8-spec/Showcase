using System;
using System.Threading;
using System.Threading.Tasks;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using Moq;
using Showcase.Infrastructure.Storage;
using Xunit;

namespace Showcase.Infrastructure.Tests;

public class CloudflareR2StorageServiceTests
{
    private readonly R2Settings _settings;
    private readonly IOptions<R2Settings> _options;
    private readonly Mock<IAmazonS3> _s3Mock;
    private readonly CloudflareR2StorageService _storageService;

    public CloudflareR2StorageServiceTests()
    {
        _settings = new R2Settings
        {
            AccountId = "test-account-id",
            AccessKeyId = "test-key-id",
            SecretAccessKey = "test-secret-key",
            BucketName = "test-bucket",
            PublicUrlPrefix = "https://cdn.showcase.com"
        };
        _options = Options.Create(_settings);
        _s3Mock = new Mock<IAmazonS3>();
        _storageService = new CloudflareR2StorageService(_options, _s3Mock.Object);
    }

    [Theory]
    [InlineData("https://cdn.showcase.com", "avatars/1.jpg", "https://cdn.showcase.com/avatars/1.jpg")]
    [InlineData("https://cdn.showcase.com/", "/avatars/1.jpg", "https://cdn.showcase.com/avatars/1.jpg")]
    [InlineData("https://cdn.showcase.com/", "avatars/1.jpg", "https://cdn.showcase.com/avatars/1.jpg")]
    [InlineData("https://cdn.showcase.com", "/avatars/1.jpg", "https://cdn.showcase.com/avatars/1.jpg")]
    public void GetPublicUrl_ShouldFormatUrlCorrectly(string prefix, string key, string expected)
    {
        var settings = _settings with { PublicUrlPrefix = prefix };
        var service = new CloudflareR2StorageService(Options.Create(settings), _s3Mock.Object);

        var result = service.GetPublicUrl(key);

        Assert.Equal(expected, result);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void GetPublicUrl_WithEmptyKey_ShouldReturnEmptyString(string? key)
    {
        var result = _storageService.GetPublicUrl(key!);
        Assert.Equal(string.Empty, result);
    }

    [Fact]
    public async Task GetPresignedUploadUrlAsync_ShouldCallS3ClientWithPutVerbAndConfiguredExpiration()
    {
        // Arrange
        var key = "posts/image.webp";
        var contentType = "image/webp";
        var expiresIn = TimeSpan.FromMinutes(15);
        var expectedUrl = "https://test-bucket.r2.cloudflarestorage.com/posts/image.webp?presigned=true";

        GetPreSignedUrlRequest? capturedRequest = null;

        _s3Mock
            .Setup(s => s.GetPreSignedURLAsync(It.IsAny<GetPreSignedUrlRequest>()))
            .Callback<GetPreSignedUrlRequest>(req => capturedRequest = req)
            .ReturnsAsync(expectedUrl);

        var beforeTime = DateTime.UtcNow.Add(expiresIn);

        // Act
        var url = await _storageService.GetPresignedUploadUrlAsync(key, contentType, expiresIn);

        // Assert
        Assert.Equal(expectedUrl, url);
        Assert.NotNull(capturedRequest);
        Assert.Equal(_settings.BucketName, capturedRequest.BucketName);
        Assert.Equal(key, capturedRequest.Key);
        Assert.Equal(HttpVerb.PUT, capturedRequest.Verb);
        Assert.Equal(contentType, capturedRequest.ContentType);
        Assert.True(capturedRequest.Expires >= beforeTime.AddSeconds(-2));
        Assert.True(capturedRequest.Expires <= beforeTime.AddSeconds(5));
    }

    [Theory]
    [InlineData("", "image/jpeg")]
    [InlineData("   ", "image/jpeg")]
    [InlineData("key", "")]
    [InlineData("key", "   ")]
    public async Task GetPresignedUploadUrlAsync_WithInvalidArguments_ShouldThrowArgumentException(string key, string contentType)
    {
        await Assert.ThrowsAsync<ArgumentException>(() =>
            _storageService.GetPresignedUploadUrlAsync(key, contentType, TimeSpan.FromMinutes(10)));
    }

    [Fact]
    public async Task DeleteAsync_ShouldCallDeleteObjectAsync()
    {
        var key = "posts/image.png";

        DeleteObjectRequest? capturedRequest = null;
        _s3Mock
            .Setup(s => s.DeleteObjectAsync(It.IsAny<DeleteObjectRequest>(), It.IsAny<CancellationToken>()))
            .Callback<DeleteObjectRequest, CancellationToken>((req, _) => capturedRequest = req)
            .ReturnsAsync(new DeleteObjectResponse());

        await _storageService.DeleteAsync(key);

        Assert.NotNull(capturedRequest);
        Assert.Equal(_settings.BucketName, capturedRequest.BucketName);
        Assert.Equal(key, capturedRequest.Key);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task DeleteAsync_WithEmptyKey_ShouldNotCallS3Client(string? key)
    {
        await _storageService.DeleteAsync(key!);

        _s3Mock.Verify(s => s.DeleteObjectAsync(It.IsAny<DeleteObjectRequest>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
