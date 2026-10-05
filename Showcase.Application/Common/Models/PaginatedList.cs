namespace Showcase.Application.Common.Models;

public class PaginatedList<T>
{
    public IReadOnlyCollection<T> Items { get; }
    public int PageNumber { get; }
    public int TotalPages { get; }
    public int TotalCount { get; }
    public int PageSize { get; }

    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    public PaginatedList(IReadOnlyCollection<T> items, int count, int pageNumber, int pageSize)
    {
        PageNumber = pageNumber > 0 ? pageNumber : 1;
        PageSize = pageSize > 0 ? pageSize : 20;
        TotalPages = (int)Math.Ceiling(count / (double)PageSize);
        TotalCount = count;
        Items = items ?? Array.Empty<T>();
    }

    public static PaginatedList<T> Create(IReadOnlyCollection<T> source, int count, int pageNumber, int pageSize)
    {
        return new PaginatedList<T>(source, count, pageNumber, pageSize);
    }

    public static PaginatedList<T> Empty(int pageNumber = 1, int pageSize = 20)
    {
        return new PaginatedList<T>(Array.Empty<T>(), 0, pageNumber, pageSize);
    }

    public PaginatedList<TResult> Map<TResult>(Func<T, TResult> map)
    {
        var mappedItems = Items.Select(map).ToList();
        return new PaginatedList<TResult>(mappedItems, TotalCount, PageNumber, PageSize);
    }
}
