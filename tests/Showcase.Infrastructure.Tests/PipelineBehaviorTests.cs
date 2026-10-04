using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging.Abstractions;
using Showcase.Application.Common.Behaviors;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Xunit;

namespace Showcase.Infrastructure.Tests;

public class PipelineBehaviorTests
{
    private sealed record TestResultRequest : IRequest<Result>;
    private sealed record TestGenericResultRequest : IRequest<Result<string>>;
    private sealed record TestNonResultRequest : IRequest<string>;

    private sealed class StubCurrentUserService : ICurrentUserService
    {
        public string? UserId => "test-user-id";
        public string? Email => "test@example.com";
        public string? Username => "testuser";
        public string? IpAddress => "127.0.0.1";
        public bool IsAuthenticated => true;
    }

    [Fact]
    public async Task UnhandledExceptionBehavior_WhenHandlerThrowsAndResponseIsResult_ShouldReturnFailureResult()
    {
        // Arrange
        var logger = NullLogger<TestResultRequest>.Instance;
        var behavior = new UnhandledExceptionBehavior<TestResultRequest, Result>(logger);
        var request = new TestResultRequest();

        RequestHandlerDelegate<Result> next = _ => throw new InvalidOperationException("Simulated database failure");

        // Act
        var result = await behavior.Handle(request, next, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.IsFailure);
        Assert.Equal("Server.UnhandledException", result.Error.Code);
        Assert.Equal("An unexpected error occurred while processing your request.", result.Error.Description);
    }

    [Fact]
    public async Task UnhandledExceptionBehavior_WhenHandlerThrowsAndResponseIsGenericResult_ShouldReturnGenericFailureResult()
    {
        // Arrange
        var logger = NullLogger<TestGenericResultRequest>.Instance;
        var behavior = new UnhandledExceptionBehavior<TestGenericResultRequest, Result<string>>(logger);
        var request = new TestGenericResultRequest();

        RequestHandlerDelegate<Result<string>> next = _ => throw new NullReferenceException("Simulated null pointer");

        // Act
        var result = await behavior.Handle(request, next, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.IsFailure);
        Assert.Equal("Server.UnhandledException", result.Error.Code);
        Assert.Equal("An unexpected error occurred while processing your request.", result.Error.Description);
    }

    [Fact]
    public async Task UnhandledExceptionBehavior_WhenHandlerSucceeds_ShouldReturnOriginalResponse()
    {
        // Arrange
        var logger = NullLogger<TestGenericResultRequest>.Instance;
        var behavior = new UnhandledExceptionBehavior<TestGenericResultRequest, Result<string>>(logger);
        var request = new TestGenericResultRequest();

        RequestHandlerDelegate<Result<string>> next = _ => Task.FromResult(Result.Success("SuccessPayload"));

        // Act
        var result = await behavior.Handle(request, next, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.IsSuccess);
        Assert.Equal("SuccessPayload", result.Value);
    }

    [Fact]
    public async Task UnhandledExceptionBehavior_WhenResponseIsNotResult_ShouldRethrowException()
    {
        // Arrange
        var logger = NullLogger<TestNonResultRequest>.Instance;
        var behavior = new UnhandledExceptionBehavior<TestNonResultRequest, string>(logger);
        var request = new TestNonResultRequest();

        RequestHandlerDelegate<string> next = _ => throw new InvalidOperationException("Non-result failure");

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => behavior.Handle(request, next, CancellationToken.None));
    }

    [Fact]
    public async Task PerformanceBehavior_WhenExecuted_ShouldReturnResponseFromNextDelegate()
    {
        // Arrange
        var logger = NullLogger<TestResultRequest>.Instance;
        var currentUserService = new StubCurrentUserService();
        var behavior = new PerformanceBehavior<TestResultRequest, Result>(logger, currentUserService);
        var request = new TestResultRequest();

        RequestHandlerDelegate<Result> next = _ => Task.FromResult(Result.Success());

        // Act
        var result = await behavior.Handle(request, next, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.IsSuccess);
    }
}
