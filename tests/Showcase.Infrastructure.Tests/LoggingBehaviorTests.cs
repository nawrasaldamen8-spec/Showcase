using Microsoft.Extensions.Logging.Abstractions;
using Showcase.Application.Common.Behaviors;
using Xunit;

namespace Showcase.Infrastructure.Tests;

public class LoggingBehaviorTests
{
    private sealed record TestLoggingRequest(string Message) : IRequest<Result>;

    private sealed class StubCurrentUserService : ICurrentUserService
    {
        public string? UserId => "logged-in-user-123";
        public string? Email => "user@example.com";
        public string? Username => "loggeduser";
        public string? IpAddress => "192.168.1.1";
        public bool IsAuthenticated => true;
    }

    [Fact]
    public async Task LoggingBehavior_WhenExecuted_ShouldCallNextDelegateAndReturnResult()
    {
        // Arrange
        var logger = NullLogger<TestLoggingRequest>.Instance;
        var currentUserService = new StubCurrentUserService();
        var behavior = new LoggingBehavior<TestLoggingRequest, Result>(logger, currentUserService);
        var request = new TestLoggingRequest("Hello Showcase");

        RequestHandlerDelegate<Result> next = _ => Task.FromResult(Result.Success());

        // Act
        var result = await behavior.Handle(request, next, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.IsSuccess);
    }
}
