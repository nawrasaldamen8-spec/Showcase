namespace Showcase.Application.Common.Interfaces;

public interface ICachableQuery
{
    string CacheKey { get; }
    TimeSpan? Expiration { get; }
}
