using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Common.Behaviors;

public class CachingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<CachingBehavior<TRequest, TResponse>> _logger;

    public CachingBehavior(
        IMemoryCache cache,
        ILogger<CachingBehavior<TRequest, TResponse>> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (request is not ICachableQuery cachableQuery)
        {
            return await next();
        }

        if (_cache.TryGetValue(cachableQuery.CacheKey, out TResponse? cachedResponse) && cachedResponse is not null)
        {
            _logger.LogDebug("Cache hit for key {CacheKey}", cachableQuery.CacheKey);
            return cachedResponse;
        }

        _logger.LogDebug("Cache miss for key {CacheKey}. Fetching from source...", cachableQuery.CacheKey);
        var response = await next();

        // Only cache successful Result responses or non-result payloads
        if (response is Result result && result.IsFailure)
        {
            return response;
        }

        var expiration = cachableQuery.Expiration ?? TimeSpan.FromMinutes(5);
        _cache.Set(cachableQuery.CacheKey, response, expiration);

        return response;
    }
}
