namespace Showcase.Application.Common.Models;

public interface IPaginationRequest
{
    int PageNumber { get; }
    int PageSize { get; }
}

public record PaginationRequest(
    int PageNumber = PaginationRequest.DefaultPageNumber,
    int PageSize = PaginationRequest.DefaultPageSize) : IPaginationRequest
{
    public const int DefaultPageNumber = 1;
    public const int DefaultPageSize = 20;
    public const int MaxPageSize = 100;

    public int NormalizedPageNumber => PageNumber > 0 ? PageNumber : DefaultPageNumber;
    public int NormalizedPageSize => PageSize is > 0 and <= MaxPageSize ? PageSize : DefaultPageSize;
    public int Skip => (NormalizedPageNumber - 1) * NormalizedPageSize;
    public int Take => NormalizedPageSize;

    public static PaginationRequest Create(int pageNumber, int pageSize) => new(pageNumber, pageSize);
}
