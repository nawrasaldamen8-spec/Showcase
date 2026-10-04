using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Extensions;
using Showcase.Application.Common.Models;
using Showcase.Domain.Entities;
using Showcase.Infrastructure.Data;
using Xunit;

namespace Showcase.Infrastructure.Tests;

public class PaginationTests
{
    private static ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    [Theory]
    [InlineData(1, 20, 1, 20, 0, 20)]
    [InlineData(0, 50, 1, 50, 0, 50)]
    [InlineData(-5, 200, 1, 20, 0, 20)] // pageSize 200 exceeds 100, falls back to default 20
    [InlineData(3, 15, 3, 15, 30, 15)]
    [InlineData(2, 100, 2, 100, 100, 100)]
    public void PaginationRequest_Should_Normalize_Correctly(
        int page,
        int size,
        int expectedPage,
        int expectedSize,
        int expectedSkip,
        int expectedTake)
    {
        var request = new PaginationRequest(page, size);

        Assert.Equal(expectedPage, request.NormalizedPageNumber);
        Assert.Equal(expectedSize, request.NormalizedPageSize);
        Assert.Equal(expectedSkip, request.Skip);
        Assert.Equal(expectedTake, request.Take);
    }

    [Fact]
    public void PaginatedList_Map_Should_Transform_Items_And_Preserve_Pagination_Metadata()
    {
        var items = new List<int> { 1, 2, 3, 4, 5 };
        var pagedList = new PaginatedList<int>(items, count: 25, pageNumber: 2, pageSize: 5);

        var mapped = pagedList.Map(x => $"Item #{x}");

        Assert.Equal(5, mapped.Items.Count);
        Assert.Equal("Item #1", mapped.Items.First());
        Assert.Equal(2, mapped.PageNumber);
        Assert.Equal(25, mapped.TotalCount);
        Assert.Equal(5, mapped.TotalPages);
        Assert.True(mapped.HasPreviousPage);
        Assert.True(mapped.HasNextPage);
    }

    [Fact]
    public async Task ToPaginatedListAsync_Should_Return_Empty_When_No_Records()
    {
        using var context = CreateInMemoryDbContext();
        var request = new PaginationRequest(1, 10);

        var result = await context.Posts.ToPaginatedListAsync(request);

        Assert.Empty(result.Items);
        Assert.Equal(0, result.TotalCount);
        Assert.Equal(0, result.TotalPages);
        Assert.False(result.HasPreviousPage);
        Assert.False(result.HasNextPage);
    }

    [Fact]
    public async Task ToPaginatedListAsync_Should_Paginate_And_Slice_Database_Query()
    {
        using var context = CreateInMemoryDbContext();
        var profile = new Profile("user-test", "Tester", "Pagination");
        context.Profiles.Add(profile);

        for (int i = 1; i <= 25; i++)
        {
            context.Posts.Add(new Post(profile.Id, $"Post {i:D2}"));
        }
        await context.SaveChangesAsync();

        var request = new PaginationRequest(PageNumber: 2, PageSize: 10);
        var pagedPosts = await context.Posts
            .OrderBy(p => p.Title)
            .ToPaginatedListAsync(request);

        Assert.Equal(10, pagedPosts.Items.Count);
        Assert.Equal(25, pagedPosts.TotalCount);
        Assert.Equal(3, pagedPosts.TotalPages);
        Assert.Equal(2, pagedPosts.PageNumber);
        Assert.True(pagedPosts.HasPreviousPage);
        Assert.True(pagedPosts.HasNextPage);
        Assert.Equal("Post 11", pagedPosts.Items.First().Title);
        Assert.Equal("Post 20", pagedPosts.Items.Last().Title);
    }
}
