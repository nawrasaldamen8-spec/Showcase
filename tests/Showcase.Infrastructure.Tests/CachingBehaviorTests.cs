using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Showcase.Application.Common.Behaviors;
using Xunit;

namespace Showcase.Infrastructure.Tests;

public class CachingBehaviorTests
{
    private sealed record TestCachableRequest(string Key) : IRequest<Result<string>>, ICachableQuery
    {
        public string CacheKey => $"test:{Key}";
        public TimeSpan? Expiration => TimeSpan.FromMinutes(10);
    }

    private sealed record TestNonCachableRequest(string Value) : IRequest<Result<string>>;

    [Fact]
    public async Task CachingBehavior_WhenRequestIsCachable_ShouldFetchFromSourceOnceAndCacheResponse()
    {
        // Arrange
        var memoryCache = new MemoryCache(new MemoryCacheOptions());
        var logger = NullLogger<CachingBehavior<TestCachableRequest, Result<string>>>.Instance;
        var behavior = new CachingBehavior<TestCachableRequest, Result<string>>(memoryCache, logger);

        var request = new TestCachableRequest("sample");
        var executionCount = 0;

        RequestHandlerDelegate<Result<string>> next = _ =>
        {
            executionCount++;
            return Task.FromResult(Result.Success($"Executed-{executionCount}"));
        };

        // Act 1: Initial call (Cache miss)
        var result1 = await behavior.Handle(request, next, CancellationToken.None);

        // Act 2: Second call (Cache hit)
        var result2 = await behavior.Handle(request, next, CancellationToken.None);

        // Assert
        Assert.True(result1.IsSuccess);
        Assert.True(result2.IsSuccess);
        Assert.Equal("Executed-1", result1.Value);
        Assert.Equal("Executed-1", result2.Value);
        Assert.Equal(1, executionCount); // Handler only called once!
    }

    [Fact]
    public async Task CachingBehavior_WhenRequestIsNotCachable_ShouldAlwaysCallNext()
    {
        // Arrange
        var memoryCache = new MemoryCache(new MemoryCacheOptions());
        var logger = NullLogger<CachingBehavior<TestNonCachableRequest, Result<string>>>.Instance;
        var behavior = new CachingBehavior<TestNonCachableRequest, Result<string>>(memoryCache, logger);

        var request = new TestNonCachableRequest("item");
        var executionCount = 0;

        RequestHandlerDelegate<Result<string>> next = _ =>
        {
            executionCount++;
            return Task.FromResult(Result.Success($"Count-{executionCount}"));
        };

        // Act
        var result1 = await behavior.Handle(request, next, CancellationToken.None);
        var result2 = await behavior.Handle(request, next, CancellationToken.None);

        // Assert
        Assert.Equal("Count-1", result1.Value);
        Assert.Equal("Count-2", result2.Value);
        Assert.Equal(2, executionCount);
    }

    [Fact]
    public async Task CachingBehavior_WhenHandlerFails_ShouldNotCacheFailure()
    {
        // Arrange
        var memoryCache = new MemoryCache(new MemoryCacheOptions());
        var logger = NullLogger<CachingBehavior<TestCachableRequest, Result<string>>>.Instance;
        var behavior = new CachingBehavior<TestCachableRequest, Result<string>>(memoryCache, logger);

        var request = new TestCachableRequest("fail-test");
        var executionCount = 0;

        RequestHandlerDelegate<Result<string>> failingNext = _ =>
        {
            executionCount++;
            return Task.FromResult(Result.Failure<string>(Error.Failure("Test.Fail", "Failure message")));
        };

        // Act 1: Failure
        var result1 = await behavior.Handle(request, failingNext, CancellationToken.None);

        // Act 2: Retry with success
        RequestHandlerDelegate<Result<string>> successfulNext = _ =>
        {
            executionCount++;
            return Task.FromResult(Result.Success("Recovered"));
        };

        var result2 = await behavior.Handle(request, successfulNext, CancellationToken.None);

        // Assert
        Assert.True(result1.IsFailure);
        Assert.True(result2.IsSuccess);
        Assert.Equal("Recovered", result2.Value);
        Assert.Equal(2, executionCount);
    }
}
