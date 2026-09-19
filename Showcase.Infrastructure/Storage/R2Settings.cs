namespace Showcase.Infrastructure.Storage;

public record R2Settings
{
    public const string SectionName = "CloudflareR2";

    public string AccountId { get; init; } = string.Empty;
    public string AccessKeyId { get; init; } = string.Empty;
    public string SecretAccessKey { get; init; } = string.Empty;
    public string BucketName { get; init; } = string.Empty;
    public string PublicUrlPrefix { get; init; } = string.Empty;
}
