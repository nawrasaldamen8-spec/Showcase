namespace Showcase.Application.Common.Extensions;

public static class PaginationExtensions
{
    public static IQueryable<T> ApplyPaging<T>(this IQueryable<T> query, int pageNumber, int pageSize)
    {
        var validPage = pageNumber > 0 ? pageNumber : PaginationRequest.DefaultPageNumber;
        var validSize = pageSize is > 0 and <= PaginationRequest.MaxPageSize ? pageSize : PaginationRequest.DefaultPageSize;
        return query.Skip((validPage - 1) * validSize).Take(validSize);
    }

    public static IQueryable<T> ApplyPaging<T>(this IQueryable<T> query, IPaginationRequest request)
    {
        return query.ApplyPaging(request.PageNumber, request.PageSize);
    }

    public static async Task<PaginatedList<T>> ToPaginatedListAsync<T>(
        this IQueryable<T> query,
        int pageNumber,
        int pageSize,
        CancellationToken ct = default)
    {
        var validPage = pageNumber > 0 ? pageNumber : PaginationRequest.DefaultPageNumber;
        var validSize = pageSize is > 0 and <= PaginationRequest.MaxPageSize ? pageSize : PaginationRequest.DefaultPageSize;

        var totalCount = await query.CountAsync(ct);
        if (totalCount == 0)
        {
            return PaginatedList<T>.Empty(validPage, validSize);
        }

        var items = await query
            .ApplyPaging(validPage, validSize)
            .ToListAsync(ct);

        return new PaginatedList<T>(items, totalCount, validPage, validSize);
    }

    public static Task<PaginatedList<T>> ToPaginatedListAsync<T>(
        this IQueryable<T> query,
        IPaginationRequest request,
        CancellationToken ct = default)
    {
        return query.ToPaginatedListAsync(request.PageNumber, request.PageSize, ct);
    }

    public static async Task<PaginatedList<TResult>> ToPaginatedListAsync<TSource, TResult>(
        this IQueryable<TSource> query,
        Func<TSource, TResult> map,
        IPaginationRequest request,
        CancellationToken ct = default)
    {
        var paged = await query.ToPaginatedListAsync(request, ct);
        return paged.Map(map);
    }
}
