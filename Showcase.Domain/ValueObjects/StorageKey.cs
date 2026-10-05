namespace Showcase.Domain.ValueObjects;

public sealed record StorageKey
{
    public const int MaxLength = 1000;

    public string Value { get; }

    private StorageKey() { Value = string.Empty; } // EF Core

    private StorageKey(string value) => Value = value;

    public static Result<StorageKey> Create(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Error.Validation("StorageKey.Empty", "Storage key cannot be empty.");

        var trimmed = value.Trim();
        if (trimmed.Length > MaxLength)
            return Error.Validation("StorageKey.TooLong", $"Storage key cannot exceed {MaxLength} characters.");

        return new StorageKey(trimmed);
    }

    public static Result<StorageKey?> CreateOptional(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Result.Success<StorageKey?>(null);

        var result = Create(value);
        return result.IsSuccess
            ? Result.Success<StorageKey?>(result.Value)
            : Result.Failure<StorageKey?>(result.Error);
    }

    public static string GetExtensionForContentType(string contentType)
    {
        return (contentType ?? string.Empty).Trim().ToLowerInvariant() switch
        {
            "image/jpeg" => "jpg",
            "image/png" => "png",
            "image/webp" => "webp",
            "image/gif" => "gif",
            _ => "jpg"
        };
    }

    public static StorageKey ForPostImage(string userId, Guid postId, string contentType)
    {
        var ext = GetExtensionForContentType(contentType);
        return new StorageKey($"media/posts/{userId.Trim()}/{postId}/{Guid.NewGuid():N}.{ext}");
    }

    public static StorageKey ForAvatar(string userId, string contentType)
    {
        var ext = GetExtensionForContentType(contentType);
        return new StorageKey($"media/avatars/{userId.Trim()}/{Guid.NewGuid():N}.{ext}");
    }

    public override string ToString() => Value;
}
