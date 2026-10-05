namespace Showcase.Application.Common.Behaviors;

public class UnhandledExceptionBehavior<TRequest, TResponse>(ILogger<TRequest> logger) : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<TRequest> _logger = logger;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        try
        {
            return await next();
        }
        catch (Exception ex)
        {
            var requestName = typeof(TRequest).Name;
            _logger.LogError(ex, "Showcase Request: Unhandled Exception for Request {Name} {@Request}", requestName, request);

            if (typeof(TResponse) == typeof(Result))
            {
                var error = Error.Failure("Server.UnhandledException", "An unexpected error occurred while processing your request.");
                return (TResponse)(object)Result.Failure(error);
            }

            if (typeof(TResponse).IsGenericType &&
                typeof(TResponse).GetGenericTypeDefinition() == typeof(Result<>))
            {
                var error = Error.Failure("Server.UnhandledException", "An unexpected error occurred while processing your request.");
                var failureMethod = typeof(Result)
                    .GetMethods()
                    .First(m => m.Name == nameof(Result.Failure) && m.IsGenericMethod)
                    .MakeGenericMethod(typeof(TResponse).GetGenericArguments()[0]);

                var result = failureMethod.Invoke(null, [error]);
                return (TResponse)result!;
            }

            throw;
        }
    }
}
