namespace Showcase.Infrastructure.Storage;

public record R2Settings
{
    public const string SectionName = "CloudflareR2";
    public const string DefaultDummyAccountId = "dummy-account-id";
    public const string DefaultDummyAccessKey = "dummy-access-key";
    public const string DefaultDummySecretKey = "dummy-secret-key";
    public const string DefaultDummyBucketName = "dummy-bucket";

    public string AccountId { get; init; } = string.Empty;
    public string AccessKeyId { get; init; } = string.Empty;
    public string SecretAccessKey { get; init; } = string.Empty;
    public string BucketName { get; init; } = string.Empty;
    public string PublicUrlPrefix { get; init; } = string.Empty;
}
