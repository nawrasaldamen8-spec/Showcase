using Showcase.Infrastructure.Data;
using Xunit;

namespace Showcase.Infrastructure.Tests;

public class TransactionTests
{
    [Fact]
    public async Task NullDbContextTransaction_ShouldCompleteAllOperationsWithoutThrowing()
    {
        // Arrange
        var transaction = new NullDbContextTransaction();

        // Act & Assert
        Assert.NotEqual(System.Guid.Empty, transaction.TransactionId);

        transaction.Commit();
        await transaction.CommitAsync();

        transaction.Rollback();
        await transaction.RollbackAsync();

        transaction.Dispose();
        await transaction.DisposeAsync();
    }

    [Fact]
    public async Task ApplicationDbContext_BeginTransactionAsync_WithInMemoryDatabase_ShouldReturnNullDbContextTransaction()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "TransactionTestDb")
            .Options;

        await using var context = new ApplicationDbContext(options);

        // Act
        await using var transaction = await context.BeginTransactionAsync();

        // Assert
        Assert.NotNull(transaction);
        Assert.IsType<NullDbContextTransaction>(transaction);

        await transaction.CommitAsync();
    }
}
